// Reexportação tipada dos dados iniciais compartilhados.
// A fonte única fica em shared/seed.js, usada também pelo servidor Node.
import {
  INITIAL_PRODUCTS as productsSeed,
  INITIAL_TABLES as tablesSeed,
  INITIAL_COMANDAS as comandasSeed,
  INITIAL_TRANSACTIONS as transactionsSeed,
  INITIAL_DIGITAL_ORDERS as digitalOrdersSeed,
  INITIAL_CONNECTED_DEVICES as connectedDevicesSeed,
  INITIAL_SYNC_QUEUE as syncQueueSeed
} from '../../shared/seed.js';
import type {
  Product,
  Table,
  Comanda,
  Transaction,
  DigitalOrder,
  DeviceConnected,
  SyncQueueItem
} from '../types';

export const INITIAL_PRODUCTS = productsSeed as unknown as Product[];
export const INITIAL_TABLES = tablesSeed as unknown as Table[];
export const INITIAL_COMANDAS = comandasSeed as unknown as Comanda[];
export const INITIAL_TRANSACTIONS = transactionsSeed as unknown as Transaction[];
export const INITIAL_DIGITAL_ORDERS = digitalOrdersSeed as unknown as DigitalOrder[];
export const INITIAL_CONNECTED_DEVICES = connectedDevicesSeed as unknown as DeviceConnected[];
export const INITIAL_SYNC_QUEUE = syncQueueSeed as unknown as SyncQueueItem[];
