const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (request, response) => {
  return response.send("Hello world");
});

app.get("/todos", (request, response) => {
  const showPending = request.query.showpending;

  fs.readFile("./store/todos.json", "utf-8", (err, data) => {
    if (err) {
      response.status(500).send("Sorry, something went wrong");
    }

    const todos = JSON.parse(data);
    if (showPending !== "1") {
      return response.json({ todos: todos });
    } else {
      return response.json({
        todos: todos.filter((todo) => todo.complete === false),
      });
    }
  });
});

app.put("/todos/:id/complete", (request, response) => {
  const id = parseInt(request.params.id);

  const findTodoId = (todos, id) => todos.findIndex((todo) => todo.id === id);

  fs.readFile("./store/todos.json", "utf-8", (err, data) => {
    if (err) {
      return response.status(500).send("Sorry, something went wrong");
    }

    const todos = JSON.parse(data);
    const todoId = findTodoId(todos, id);

    todos[todoId].complete = true;

    fs.writeFile("./store/todos.json", JSON.stringify(todos), () => {
      return response.send({ status: 200 });
    });
  });
});

app.post("/todos", (req, res) => {
  if (!req.body.name) {
    return res.status(400).send("Name missing");
  }

  fs.readFile("./store/todos.json", "utf-8", (err, data) => {
    if (err) {
      return res.status(500).send("Sorry, something went wrong");
    }

    const todos = JSON.parse(data);
    const maxId = Math.max.apply(
      Math,
      todos.map((t) => t.id)
    );

    todos.push({
      id: maxId + 1,
      complete: false,
      name: req.body.name,
    });

    fs.writeFile("./store/todos.json", JSON.stringify(todos), () => {
      return res.json({ status: "ok" });
    });
  });
});

app.listen(3000, () => {
  console.log("Application is running on http://localhost:3000");
});
