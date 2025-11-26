export default {
  async beforeCreate(event) {
    const { data } = event.params;

    // Agar foydalanuvchi forma orqali maqola_id ni kiritmagan bo'lsa (bo'sh/undefined bo'lsa),
    // avtomatik ravishda oxirgi maqola_id ga +1 qilib yozamiz.
    if (!data.maqola_id) {
      const lastRecord = await strapi.db
        .query('api::jurnallar.jurnallar')
        .findMany({
          orderBy: { maqola_id: 'desc' },
          limit: 1,
        });

      let nextNumber = 1;

      if (lastRecord.length > 0 && lastRecord[0].maqola_id) {
        nextNumber = parseInt(lastRecord[0].maqola_id, 10) + 1;
      }

      // 0001 format
      data.maqola_id = String(nextNumber).padStart(4, '0');
    }
    // Aks holda (fieldda qiymat bo'lsa) o'sha qiymat o'zgarishsiz qoladi:
    // fieldda ko'rgan qiymat API javobida ham aynan shunday bo'ladi.
  },
};
  