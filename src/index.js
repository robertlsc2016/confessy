const express = require("express");
const res = require("express/lib/response");
const app = express();

const moment = require("moment");
const tz = require("moment-timezone");
const Swal = require("sweetalert2");

const connection = require("./database/database");
const Perguntas = require("./database/Perguntas");
const Respostas = require("./database/Respostas");

const bodyParser = require("body-parser");
const req = require("express/lib/request");

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

app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "69420"); // O valor pode ser qualquer string
  next();
});

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
        if (dadosResposta) {
          res.render("pergunta", {
            dadosPergunta: dadosPergunta,
            dadosResposta: dadosResposta,
          });
        } else {
          res.render("pergunta", {
            dadosPergunta: dadosPergunta,
          });
        }
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

app.post("/salvarpergunta", (req, res) => {
  // Gerando ID aleatório
  // const idConfissao = Math.random().toString(36).substr(2, 8);
  let hora_brasilia = moment().tz("America/Sao_Paulo").format();

  // console.log(req)

  const { title, description, name } = req.body;

  // let titulo = req.body.title.trim() || "";
  // let description = req.body.description.trim() || "";
  // let name = req.body.name.trim() || "anonymous";

  // Salvando no banco de dados (aqui você pode incluir o ID)
  Perguntas.create({
    // id: idConfissao, // Incluindo o ID gerado
    title: title,
    description: description,
    name: name || "anonymous",
    datacriacao: hora_brasilia,
  })
    .then((data) => {
      console.log("Confissão salva com sucesso!");
      res
        .status(200)
        .json({
          message: "Confissão salva com sucesso!",
          id: data.dataValues.id,
        });
      // res.redirect("/");
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "Confissão salva com sucesso!" });

      // res.redirect("/");
    });
});

app.post("/enviarreposta", (req, res) => {
  let resposta = req.body.response;
  let perguntaID = req.body.perguntaID;
  let autorResposta = req.body.autorResposta || "anonymous";
  let hora_brasilia = moment().tz("America/Sao_Paulo").format();

  Respostas.create({
    body: resposta,
    perguntaID: perguntaID,
    autorResposta: autorResposta,
    datacriacao: hora_brasilia,
  })
    .then(() => {
      res.redirect("/confissao/" + perguntaID);
    })
    .catch((error) => {
      console.log(error);
    });
});

app.listen(process.env.PORT || 8081, "0.0.0.0", () => {
  console.log(`http://localhost:8081`);
});
