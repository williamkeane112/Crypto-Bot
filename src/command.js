require("dotenv/config");
const { REST, Routes } = require("discord.js");

const botID = "1275011344487288892";
const rest = new REST({ version: 10 }).setToken(process.env.DISCORD_TOKEN);

const command = async () => {
  try {
    await rest.put(Routes.applicationCommands(botID), {
      name: "price",
      description: "Get the current price of a cryptocurrency",
      options: [
        {
          type: 3,
          name: "symbol",
          description: "The symbol of the cryptocurrency (e.g., BTC, ETH)",
          required: true,
        },
      ],
    });
  } catch (err) {
    console.log(err);
  }
};
command();
