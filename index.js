require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const cron = require("node-cron");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  cron.schedule("0 10 * * *", async () => {
    try {
      const response = await axios.get(
        "https://horoscopo-today-ivory.vercel.app/api/horoscopes"
      );
      console.log("response", response);
      const data = response.data;

      const today = new Date().toISOString().split("T")[0];

      const todayData = data.find((entry) => entry.date === today);

      if (todayData) {
        let formattedText = todayData.text.replace(/\\n/g, "\n\n");

        formattedText = formattedText.replace(
          /(\d{4} M\. \d{4})\n\n/g,
          "$1\n\n\n"
        );

        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`Horóscopo de ${today}`)
          .setDescription(formattedText);

        const channel = await client.channels.fetch(CHANNEL_ID);
        if (
          channel &&
          channel.permissionsFor(client.user).has("SEND_MESSAGES")
        ) {
          await channel.send({ embeds: [embed] });
        } else {
          console.error(
            "Canal não encontrado ou bot não tem permissão para enviar mensagens!"
          );
        }
      } else {
        console.error("Nenhum dado encontrado para a data de hoje.");
      }
    } catch (error) {
      console.error("Erro ao buscar dados da API:", error);
    }
  });
});

client.login(DISCORD_TOKEN);
