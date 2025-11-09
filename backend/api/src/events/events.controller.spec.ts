import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventTopic, SourceModule, EventStatus, ProcessingStatus } from './enums';
import { HttpStatus } from '@nestjs/common';

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  // Mock EventsService
  const mockEventsService = {
    publishEvent: jest.fn(),
    acknowledgeEvent: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getPendingEvents: jest.fn(),
    getStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('publishEvent', () => {
    it('should publish event successfully', async () => {
      const createEventDto = {
        topic: EventTopic.SURAT_STATUS_CHANGED,
        payload: { surat_id: 123 },
        source_module: SourceModule.AGENDA,
        idempotency_key: 'agenda-surat-123-1699012345678',
      };

      const mockEvent = {
        id: 'uuid-123',
        ...createEventDto,
        status: EventStatus.PENDING,
        timestamp: new Date(),
      };

      mockEventsService.publishEvent.mockResolvedValue(mockEvent);

      const result = await controller.publishEvent(createEventDto);

      expect(service.publishEvent).toHaveBeenCalledWith(createEventDto);
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Event berhasil di-publish',
        data: mockEvent,
      });
    });
  });

  describe('acknowledgeEvent', () => {
    it('should acknowledge event successfully', async () => {
      const acknowledgeDto = {
        event_id: 'event-uuid-123',
        consumer_module: SourceModule.EKSPEDISI,
        processing_status: ProcessingStatus.SUCCESS,
      };

      const mockAck = {
        id: 'ack-uuid-123',
        ...acknowledgeDto,
      };

      mockEventsService.acknowledgeEvent.mockResolvedValue(mockAck);

      const result = await controller.acknowledgeEvent(acknowledgeDto);

      expect(service.acknowledgeEvent).toHaveBeenCalledWith(acknowledgeDto);
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Event berhasil di-acknowledge',
        data: mockAck,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated events', async () => {
      const filterDto = {
        page: 1,
        limit: 20,
      };

      const mockResult = {
        data: [{ id: '1' }, { id: '2' }],
        meta: {
          page: 1,
          limit: 20,
          total: 2,
          total_pages: 1,
        },
      };

      mockEventsService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(filterDto);

      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Events berhasil diambil',
        ...mockResult,
      });
    });
  });

  describe('getStatistics', () => {
    it('should return event statistics', async () => {
      const mockStats = {
        total: 10,
        pending: 3,
        consumed: 6,
        failed: 1,
        success_rate: '60.00%',
      };

      mockEventsService.getStatistics.mockResolvedValue(mockStats);

      const result = await controller.getStatistics();

      expect(service.getStatistics).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Statistik events berhasil diambil',
        data: mockStats,
      });
    });
  });

  describe('getPendingEvents', () => {
    it('should return pending events', async () => {
      const mockEvents = [
        { id: '1', status: EventStatus.PENDING },
        { id: '2', status: EventStatus.PENDING },
      ];

      mockEventsService.getPendingEvents.mockResolvedValue(mockEvents);

      const result = await controller.getPendingEvents();

      expect(service.getPendingEvents).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Pending events berhasil diambil',
        data: mockEvents,
        total: 2,
      });
    });
  });

  describe('findOne', () => {
    it('should return event by id', async () => {
      const mockEvent = {
        id: 'event-uuid-123',
        topic: EventTopic.SURAT_STATUS_CHANGED,
        acknowledgments: [],
      };

      mockEventsService.findOne.mockResolvedValue(mockEvent);

      const result = await controller.findOne('event-uuid-123');

      expect(service.findOne).toHaveBeenCalledWith('event-uuid-123');
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Event berhasil diambil',
        data: mockEvent,
      });
    });
  });
});