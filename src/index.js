const express = require("express");
const app = express();
const moment = require("moment");
const tz = require("moment-timezone");
const bodyParser = require("body-parser");
const connection = require("./database/database");
const Perguntas = require("./database/Perguntas");
const Respostas = require("./database/Respostas");
require("dotenv").config();

const { sendWhatsAppMessage, initializeWhatsApp } = require("./indexBaileys");
initializeWhatsApp();
// Número de destino para as mensagens do WhatsApp (substitua pelo número desejado)
const WHATSAPP_NUMBER = process.env.STRING_TO_GROUP_WWEBJS; // Exemplo: +5511999999999
// const WHATSAPP_NEWSLETTER = process.env.STRING_TO_GROUP_WWEBJS_NEWSLETTER; // Exemplo: +5511999999999

connection
  .authenticate()
  .then(() => {
    console.log("CONEXÃO ESTABELECIDA");
  })
  .catch((msgError) => {
    console.log(`error: ${msgError}`);
  });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", "./src/views");

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  Perguntas.findAll({
    raw: true,
    order: [["id", "DESC"]],
  }).then((perguntas) => {
    Respostas.findAll({
      raw: true,
      order: [["id", "DESC"]],
    }).then((dadosResposta) => {
      res.render("index", {
        perguntas: perguntas,
        respostas: dadosResposta,
      });
    });
  });
});

app.get("/confessar", (req, res) => {
  res.render("perguntar");
});

app.get("/confissao/:id", (req, res) => {
  let id = req.params.id;

  Perguntas.findOne({ raw: true, where: { id: id } }).then((dadosPergunta) => {
    if (dadosPergunta) {
      Respostas.findAll({
        order: [["id", "DESC"]],
        where: { perguntaID: id },
      }).then((dadosResposta) => {
        res.render("pergunta", {
          dadosPergunta: dadosPergunta,
          dadosResposta: dadosResposta || [],
        });
      });
    } else {
      res.render("pergunta", {
        dadosPergunta: {
          title: "Pergunta não encontrada ou inexistente",
          description: "Pergunta não encontrada ou inexistente",
        },
      });
    }
  });
});

app.post("/salvarpergunta", async (req, res) => {
  let hora_brasilia = moment().tz("America/Sao_Paulo").format();
  const { title, description, name } = req.body;

  try {
    const novaPergunta = await Perguntas.create({
      title: title,
      description: description,
      name: name || "anonymous",
      datacriacao: hora_brasilia,
    });

    // Enviar mensagem via WhatsApp
    const message = `Nova confissão recebida!\n\nTítulo: ${title}\nDescrição: ${description}\nAutor: ${
      name || "anonymous"
    }\nData: ${hora_brasilia}\n\nLink da confissão: https://confessy.pt/confissao/${
      novaPergunta.dataValues.id
    }`;
    const result = await sendWhatsAppMessage(WHATSAPP_NUMBER, message);
    // await sendWhatsAppMessage(WHATSAPP_NEWSLETTER, message);

    if (!result.success) {
      console.error("Falha ao enviar mensagem WhatsApp:", result.error);
    }

    res.status(200).json({
      message: "Confissão salva com sucesso!",
      id: novaPergunta.dataValues.id,
    });
  } catch (error) {
    console.error("Erro ao salvar confissão:", error);
    res
      .status(500)
      .json({ message: "Erro ao salvar confissão", error: error.message });
  }
});

app.post("/enviarreposta", async (req, res) => {
  let resposta = req.body.response;
  let perguntaID = req.body.perguntaID;
  let autorResposta = req.body.autorResposta || "anonymous";
  let hora_brasilia = moment().tz("America/Sao_Paulo").format();

  try {
    const novaResposta = await Respostas.create({
      body: resposta,
      perguntaID: perguntaID,
      autorResposta: autorResposta,
      datacriacao: hora_brasilia,
    });

    // Buscar a pergunta correspondente para incluir na mensagem
    const pergunta = await Perguntas.findOne({ where: { id: perguntaID } });

    // Enviar mensagem via WhatsApp
    const message = `Nova resposta para a confissão #${perguntaID}!\n\Confissão: ${pergunta.title}\nResposta: ${resposta}\nAutor: ${autorResposta}\nData: ${hora_brasilia}\n\nLink da confissão: https://confessy.pt/confissao/${perguntaID}`;
    const result = await sendWhatsAppMessage(WHATSAPP_NUMBER, message);
    // await sendWhatsAppMessage(STRING_TO_GROUP_WWEBJS_NEWSLETTER, message);

    if (!result.success) {
      console.error("Falha ao enviar mensagem WhatsApp:", result.error);
    }

    res.redirect("/confissao/" + perguntaID);
  } catch (error) {
    console.error("Erro ao salvar resposta:", error);
    res.status(500).send("Erro ao salvar resposta");
  }
});

app.listen(process.env.PORT || 8081, "0.0.0.0", () => {
  console.log(`http://localhost:8081`);
});
