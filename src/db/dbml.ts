import { sqliteGenerate } from 'drizzle-dbml-generator';
import * as schema from './drizzle-schema';

const rootProjectFolder = process.cwd();

const out = rootProjectFolder + '/drizzle/dbml.dbml';
const relational = true;

sqliteGenerate({ schema: schema, out, relational });
