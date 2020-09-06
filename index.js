const Discord = require('discord.js');
const client = new Discord.Client()
const Canvacord = require("canvacord");
const db = require('quick.db');
const { MessageAttachment } = require("discord.js");

const PREFIX = "!"

client.on('ready', () => console.log("active"))

client.on('message', async message => {
    if (message.author.bot) return
    xp(message)
    if (message.content.startsWith(`${PREFIX}rank`)) {
        var user = message.mentions.users.first() || message.author
        var level = db.get(`guild_${message.guild.id}_level_${user.id}`) || 0
        level = level.toString()
        let xp = db.get(`guild_${message.guild.id}_xp_${user.id}`) || 0
        var xpNeeded = level *500 + 500
        let every = db
            .all()
            .filter(i => i.ID.startsWith(`guild_${message.guild.id}_xptotal_`))
            .sort((a, b) => b.data - a.data)
        var rank = every.map(x => x.ID).indexOf(`guild_${message.guild.id}_xptotal_${user.id}`) + 1
        rank = rank.toString()
        let image = await Canvacord.rank({
            username: user.username,
            discim: user.discriminator,
            status: user.presence.status,
            currentXP: xp.toString(),
            neededXP: xpNeeded.toString(),
            rank,
            level,
            avatarURL: user.displayAvatarURL({format: "png"}),
            color: "white"
        })
        const attachment = new MessageAttachment(image, "rank.png")
        return message.channel.send(attachment);
    }
})

function xp(message){
    if (message.content.startsWith(PREFIX)) return
    const randomNumber = Math.floor(Math.random() * 10) + 15
    db.add(`guild_${message.guild.id}_xp_${message.author.id}`, randomNumber)
    db.add(`guild_${message.guild.id}_xptotal_${message.author.id}`, randomNumber)
    var level = db.get(`guild_${message.guild.id}_level_${message.author.id}`) || 1
    var xp = db.get(`guild_${message.guild.id}_xp_${message.author.id}`)
    var xpNeeded = level * 500
    if (xpNeeded < xp) {
        var newLevel = db.add(`guild_${message.guild.id}_level_${message.author.id}` , 1)
        db.subtract(`guild_${message.guild.id}_xp_${message.author.id}`, xpNeeded)
        message.channel.send(`${message.author}, You have leveled up to level ${newLevel}`)
    }
}

client.login(process.env.token);