'use strict';

const fs = require('fs');
const path = require('path');

/**
 * TemplateDataManager
 *
 * Replace this with your domain data store.
 * Stores records in a JSON file; swap for SQLite, a remote API, etc.
 */
class TemplateDataManager {
  /**
   * @param {string} dataPath  Path to the add-on's data directory
   */
  constructor(dataPath) {
    this.dataPath = dataPath;
    /** @type {Map<string, Record<string, unknown>>} */
    this.records = new Map();
    this.dataFile = path.join(dataPath, 'records.json');
  }

  /**
   * Load data from disk. Called once during register().
   */
  async load() {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
    if (!fs.existsSync(this.dataFile)) {
      return; // Start empty — no file yet
    }
    const raw = fs.readFileSync(this.dataFile, 'utf8');
    const arr = JSON.parse(raw);
    this.records.clear();
    for (const record of arr) {
      if (record.id) {
        this.records.set(String(record.id), record);
      }
    }
  }

  /**
   * Persist records to disk.
   */
  async save() {
    const arr = Array.from(this.records.values());
    fs.writeFileSync(this.dataFile, JSON.stringify(arr, null, 2), 'utf8');
  }

  /** @returns {number} */
  count() {
    return this.records.size;
  }

  /**
   * @param {string} id
   * @returns {Record<string, unknown> | undefined}
   */
  getById(id) {
    return this.records.get(String(id));
  }

  /**
   * Simple case-insensitive search across all string fields.
   * @param {string} query
   * @returns {Array<Record<string, unknown>>}
   */
  search(query) {
    const q = query.toLowerCase();
    if (!q) return Array.from(this.records.values());
    return Array.from(this.records.values()).filter(r =>
      Object.values(r).some(
        v => typeof v === 'string' && v.toLowerCase().includes(q)
      )
    );
  }

  /**
   * @param {Record<string, unknown>} record  Must include an `id` field
   */
  async upsert(record) {
    if (!record.id) throw new Error('record.id is required');
    this.records.set(String(record.id), record);
    await this.save();
  }

  /**
   * @param {string} id
   */
  async delete(id) {
    this.records.delete(String(id));
    await this.save();
  }
}

module.exports = TemplateDataManager;
