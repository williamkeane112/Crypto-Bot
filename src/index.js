require("dotenv/config");
const axios = require("axios");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const cache = new Map();

// ready
client.on("ready", () => {
  console.log("Bot Is Online");
});

// user use command
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand() || interaction.commandName !== "price") return;

  const coinSymbol = interaction.options.getString("symbol").toUpperCase();

  if (cache.has(coinSymbol)) {
    const cachedData = cache.get(coinSymbol);
    await sendEmbed(interaction, cachedData);
    return;
  }

  try {
    const response = await axios.get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", {
      headers: {
        "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY,
        Accept: "application/json",
      },
    });

    const cryptoData = response.data.data.find((crypto) => crypto.symbol === coinSymbol);
    if (!cryptoData) {
      await interaction.reply(`Symbol ${coinSymbol} not found.`);
      return;
    }

    const { name, quote } = cryptoData;
    const { price, percent_change_24h: percentChange24h } = quote.USD;
    const coinData = { name, price, percentChange24h };

    // Simpan ke cache dengan durasi 10 menit
    cache.set(coinSymbol, coinData);
    setTimeout(() => cache.delete(coinSymbol), 600000);

    await sendEmbed(interaction, coinData);
  } catch (err) {
    console.error("Error fetching data:", err);
    await interaction.reply("Failed to fetch data. Please try again later.");
  }
});

// Fungsi untuk kirim embed
async function sendEmbed(interaction, { name, price, percentChange24h }) {
  const embed = new EmbedBuilder()
    .setColor(percentChange24h >= 0 ? "Green" : "Red")
    .setTitle(name)
    .addFields({
      name: "Price In 24h",
      value: `**${price.toFixed(2)}** (${percentChange24h >= 0 ? "+" : ""}${percentChange24h.toFixed(2)}%)`,
    });

  await interaction.reply({ embeds: [embed] });
}

client.login(process.env.DISCORD_TOKEN);
