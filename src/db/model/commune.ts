import { index, int, text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { TIMESTAMP_FIELDS } from '@/db/shared';

export const communeTable = sqliteTable(
    'core_communemodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        name: text('name').notNull(),
        regionId: int('region_id').references(() => regionTable.id),
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

export const regionTable = sqliteTable(
    'core_regionmodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
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
