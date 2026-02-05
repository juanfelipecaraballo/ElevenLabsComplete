import { Pool } from "pg";

export type TTSStatus = "started" | "completed" | "failed";

export interface TTSRequest {
  id: string;
  text: string;
  voiceId: string;
  status: TTSStatus;
  createdAt: Date;
  completedAt?: Date;
}

export class TTSRepository {
  constructor(private readonly db: Pool) {}

  async create(text: string, voiceId: string): Promise<TTSRequest> {
    console.log("Saving TTS request to DB...");
    const result = await this.db.query(
      `
      INSERT INTO tts_requests (id, text, voice_id, status)
      VALUES (gen_random_uuid(), $1, $2, 'started')
      RETURNING *
      `,
      [text, voiceId],
    );
    console.log("TTS request saved");

    return this.mapRow(result.rows[0]);
  }

  async markCompleted(id: string): Promise<void> {
    await this.db.query(
      `
      UPDATE tts_requests
      SET status = 'completed',
          completed_at = now()
      WHERE id = $1
      `,
      [id],
    );
  }

  async markFailed(id: string): Promise<void> {
    await this.db.query(
      `
      UPDATE tts_requests
      SET status = 'failed'
      WHERE id = $1
      `,
      [id],
    );
  }

  private mapRow(row: any): TTSRequest {
    return {
      id: row.id,
      text: row.text,
      voiceId: row.voice_id,
      status: row.status,
      createdAt: row.created_at,
      completedAt: row.completed_at,
    };
  }
}
