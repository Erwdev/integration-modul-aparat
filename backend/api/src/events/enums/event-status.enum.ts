//untuk lifecycle dari event yang masuk 
export enum EventStatus {
    PENDING = 'pending',
    PROCESSED = 'processed',
    FAILED = 'failed',
}

export enum EventTopic {
  // ===================================
  // Modul Surat Events
  // ===================================
  SURAT_CREATED = 'surat.created',
  SURAT_STATUS_CHANGED = 'surat.statusChanged',
  SURAT_UPDATED = 'surat.updated',
  SURAT_DELETED = 'surat.deleted',

  // ===================================
  // Modul Aparat Events
  // ===================================
  APARAT_CREATED = 'aparat.created',
  APARAT_UPDATED = 'aparat.updated',
  APARAT_STATUS_CHANGED = 'aparat.statusChanged',
  APARAT_DELETED = 'aparat.deleted',

  // ===================================
  // Modul Ekspedisi Events
  // ===================================
  EKSPEDISI_CREATED = 'ekspedisi.created',
  EKSPEDISI_STATUS_CHANGED = 'ekspedisi.statusChanged',
  EKSPEDISI_DELIVERED = 'ekspedisi.delivered',
  EKSPEDISI_RETURNED = 'ekspedisi.returned',

  // ===================================
  // Modul Agenda Events
  // ===================================
  AGENDA_CREATED = 'agenda.created',
  AGENDA_UPDATED = 'agenda.updated',
  AGENDA_COMPLETED = 'agenda.completed',
  AGENDA_CANCELLED = 'agenda.cancelled',
}

/**
 * Source modules yang dapat mengirim events
 */
export enum SourceModule {
  SURAT = 'SURAT',
  APARAT = 'APARAT',
  EKSPEDISI = 'EKSPEDISI',
  AGENDA = 'AGENDA',
  DISPOSISI = 'DISPOSISI',
}

/**
 * Processing status untuk acknowledgment
 * (untuk backward compatibility dengan ProcessingStatus)
 */
export enum ProcessingStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}