import { schemaBuilder } from '@/schema/schema-builder';
import './user';
import './college';
import './convocatory';
import './organization';
import './scholarship';
import './scholarship-form';
import './scholarship-application';
import './talk';
import './custom-queries';
import './admin-custom-queries';

export const yogaSchema = schemaBuilder.toSchema();
