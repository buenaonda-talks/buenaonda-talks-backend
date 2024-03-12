import { index, integer, text, pgTable, serial } from 'drizzle-orm/pg-core';
import { TIMESTAMP_FIELDS } from '@/db/shared';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const communeTable = pgTable(
    'core_communemodel',
    {
        id: serial('id').primaryKey(),
        name: text('name').notNull(),
        regionId: integer('region_id')
            .references(() => regionTable.id, {
                onDelete: 'cascade',
            })
            .notNull(),
        normalizedName: text('normalized_name').notNull(),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            normalizedName52Bac174: index(
                'core_communemodel_normalized_name_52bac174',
            ).on(table.normalizedName),
            regionIdE6A2Af19: index('core_communemodel_region_id_e6a2af19').on(
                table.regionId,
            ),
        };
    },
);

export const regionTable = pgTable(
    'core_regionmodel',
    {
        id: serial('id').primaryKey(),
        name: text('name').notNull(),
        normalizedName: text('normalized_name').notNull(),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            normalizedName3C55D64D: index('core_regionmodel_normalized_name_3c55d64d').on(
                table.normalizedName,
            ),
        };
    },
);

export const selectCommuneSchema = createSelectSchema(communeTable);
export type SelectCommuneSchema = z.infer<typeof selectCommuneSchema>;

export const selectRegionSchema = createSelectSchema(regionTable);
export type SelectRegionSchema = z.infer<typeof selectRegionSchema>;
