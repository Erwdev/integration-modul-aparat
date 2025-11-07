import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventsService } from './events.service';
import { Event, EventAcknowledgment } from './entities';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventStatus, ProcessingStatus, EventTopic, SourceModule } from './enums';

describe('EventsService', () => {
  let service: EventsService;
  let eventRepository: Repository<Event>;
  let acknowledgmentRepository: Repository<EventAcknowledgment>;

  // Mock repositories
  const mockEventRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockAcknowledgmentRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepository,
        },
        {
          provide: getRepositoryToken(EventAcknowledgment),
          useValue: mockAcknowledgmentRepository,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
    acknowledgmentRepository = module.get<Repository<EventAcknowledgment>>(
      getRepositoryToken(EventAcknowledgment),
    );

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('publishEvent', () => {
    const createEventDto = {
      topic: EventTopic.SURAT_STATUS_CHANGED,
      payload: { surat_id: 123 },
      source_module: SourceModule.AGENDA,
      idempotency_key: 'agenda-surat-123-1699012345678',
    };

    it('should publish event successfully', async () => {
      const mockEvent = {
        id: 'uuid-123',
        ...createEventDto,
        status: EventStatus.PENDING,
        timestamp: new Date(),
      };

      mockEventRepository.findOne.mockResolvedValue(null); // No duplicate
      mockEventRepository.create.mockReturnValue(mockEvent);
      mockEventRepository.save.mockResolvedValue(mockEvent);

      const result = await service.publishEvent(createEventDto);

      expect(mockEventRepository.findOne).toHaveBeenCalledWith({
        where: { idempotency_key: createEventDto.idempotency_key },
      });
      expect(mockEventRepository.create).toHaveBeenCalledWith({
        ...createEventDto,
        status: EventStatus.PENDING,
        timestamp: expect.any(Date),
      });
      expect(result).toEqual(mockEvent);
    });

    it('should throw ConflictException if idempotency_key exists', async () => {
      mockEventRepository.findOne.mockResolvedValue({ id: 'existing-uuid' });

      await expect(service.publishEvent(createEventDto)).rejects.toThrow(ConflictException);
      expect(mockEventRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('acknowledgeEvent', () => {
    const acknowledgeDto = {
      event_id: 'event-uuid-123',
      consumer_module: SourceModule.EKSPEDISI,
      processing_status: ProcessingStatus.SUCCESS,
    };

    it('should acknowledge event successfully', async () => {
      const mockEvent = {
        id: 'event-uuid-123',
        status: EventStatus.PENDING,
      };

      const mockAck = {
        id: 'ack-uuid-123',
        ...acknowledgeDto,
      };

      mockEventRepository.findOne.mockResolvedValue(mockEvent);
      mockAcknowledgmentRepository.findOne.mockResolvedValue(null);
      mockAcknowledgmentRepository.create.mockReturnValue(mockAck);
      mockAcknowledgmentRepository.save.mockResolvedValue(mockAck);
      mockEventRepository.save.mockResolvedValue({
        ...mockEvent,
        status: EventStatus.CONSUMED,
      });

      const result = await service.acknowledgeEvent(acknowledgeDto);

      expect(result).toEqual(mockAck);
      expect(mockEventRepository.save).toHaveBeenCalledWith({
        ...mockEvent,
        status: EventStatus.CONSUMED,
      });
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventRepository.findOne.mockResolvedValue(null);

      await expect(service.acknowledgeEvent(acknowledgeDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if already acknowledged', async () => {
      mockEventRepository.findOne.mockResolvedValue({ id: 'event-uuid-123' });
      mockAcknowledgmentRepository.findOne.mockResolvedValue({ id: 'existing-ack' });

      await expect(service.acknowledgeEvent(acknowledgeDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if status=failed but no error_message', async () => {
      const failedDto = {
        ...acknowledgeDto,
        processing_status: ProcessingStatus.FAILED,
      };

      mockEventRepository.findOne.mockResolvedValue({ id: 'event-uuid-123' });
      mockAcknowledgmentRepository.findOne.mockResolvedValue(null);

      await expect(service.acknowledgeEvent(failedDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return event with acknowledgments', async () => {
      const mockEvent = {
        id: 'event-uuid-123',
        topic: EventTopic.SURAT_STATUS_CHANGED,
        acknowledgments: [],
      };

      mockEventRepository.findOne.mockResolvedValue(mockEvent);

      const result = await service.findOne('event-uuid-123');

      expect(result).toEqual(mockEvent);
      expect(mockEventRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'event-uuid-123' },
        relations: ['acknowledgments'],
      });
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPendingEvents', () => {
    it('should return pending events', async () => {
      const mockEvents = [
        { id: '1', status: EventStatus.PENDING },
        { id: '2', status: EventStatus.PENDING },
      ];

      mockEventRepository.find.mockResolvedValue(mockEvents);

      const result = await service.getPendingEvents();

      expect(result).toEqual(mockEvents);
      expect(mockEventRepository.find).toHaveBeenCalledWith({
        where: { status: EventStatus.PENDING },
        order: { timestamp: 'ASC' },
      });
    });
  });

  describe('getStatistics', () => {
    it('should return event statistics', async () => {
      mockEventRepository.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3)  // pending
        .mockResolvedValueOnce(6)  // consumed
        .mockResolvedValueOnce(1); // failed

      const result = await service.getStatistics();

      expect(result).toEqual({
        total: 10,
        pending: 3,
        consumed: 6,
        failed: 1,
        success_rate: '60.00%',
      });
    });

    it('should return 0% success rate if no events', async () => {
      mockEventRepository.count.mockResolvedValue(0);

      const result = await service.getStatistics();

      expect(result.success_rate).toBe('0%');
    });
  });
});