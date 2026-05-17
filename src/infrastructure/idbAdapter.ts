import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Observation } from "../domain/types";
import { CryptoService } from "./cryptoService";

interface ObserviKidsDB extends DBSchema {
  observations: {
    key: string;
    value: {
      id: string;
      tenantId: string;
      ciphertext: string; // Encrypted JSON of the observation
      iv: string;
      timestamp: number;
    };
    indexes: {
      "by-tenant": string;
    };
  };
}

class IDBAdapter {
  private dbPromise: Promise<IDBPDatabase<ObserviKidsDB>>;

  constructor() {
    this.dbPromise = openDB<ObserviKidsDB>("observikids-db", 1, {
      upgrade(db) {
        const store = db.createObjectStore("observations", {
          keyPath: "id",
        });
        store.createIndex("by-tenant", "tenantId");
      },
    });
  }

  async saveObservation(observation: Observation): Promise<void> {
    const db = await this.dbPromise;
    const jsonStr = JSON.stringify(observation);
    const { ciphertext, iv } = await CryptoService.encrypt(jsonStr);

    await db.put("observations", {
      id: observation.id,
      tenantId: observation.tenantId,
      ciphertext,
      iv,
      timestamp: observation.timestamp,
    });
  }

  async getObservations(tenantId: string): Promise<Observation[]> {
    const db = await this.dbPromise;
    const records = await db.getAllFromIndex("observations", "by-tenant", tenantId);
    
    const observations: Observation[] = [];
    for (const record of records) {
      try {
        const jsonStr = await CryptoService.decrypt(record.ciphertext, record.iv);
        if (jsonStr) {
          observations.push(JSON.parse(jsonStr) as Observation);
        }
      } catch (e) {
        console.error("Failed to parse decrytped observation", record.id);
      }
    }
    
    // Sort descending by timestamp
    return observations.sort((a, b) => b.timestamp - a.timestamp);
  }

  async deleteObservation(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete("observations", id);
  }
}

export const dbAdapter = new IDBAdapter();
