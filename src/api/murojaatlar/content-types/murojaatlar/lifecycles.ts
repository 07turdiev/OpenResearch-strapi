export default {
  async afterCreate(event) {
    const { result } = event;

    // Telegram konfiguratsiyasi .env ichida bo'lishi kerak
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      // Konfiguratsiya yo'q bo'lsa, shunchaki xatoni log qilib, davom etamiz
      strapi.log.warn(
        '[murojaatlar] TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID topilmadi, xabar yuborilmadi.'
      );
      return;
    }

    // Xabar matnini tayyorlash
    const name = result.Ismi || '-';
    const phone = result.Telefon || '-';

    // Rich text (blocks) maydonini odatiy matnga aylantiramiz
    let body = '-';

    if (result.Murojaat_matni) {
      if (typeof result.Murojaat_matni === 'string') {
        body = result.Murojaat_matni;
      } else if (Array.isArray(result.Murojaat_matni)) {
        body = result.Murojaat_matni
          .map((block) => {
            if (!block || !Array.isArray(block.children)) {
              return '';
            }

            return block.children
              .map((child) =>
                child && typeof child.text === 'string' ? child.text : ''
              )
              .join('');
          })
          .filter((line) => line && line.trim().length > 0)
          .join('\n');
      } else {
        // Fallback: agar tuzilma kutilganidan farq qilsa
        body = JSON.stringify(result.Murojaat_matni);
      }
    }

    const text =
      `Yangi murojaat keldi.\n\n` +
      `Ismi: ${name}\n` +
      `Telefon: ${phone}\n\n` +
      `Murojaat matni:\n${body}`;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      });
    } catch (error) {
      // Telegram tomondagi xato API javobiga ta'sir qilmasligi uchun faqat log qilamiz
      strapi.log.error('[murojaatlar] Telegram xabar yuborishda xatolik:', error);
    }
  },
};


