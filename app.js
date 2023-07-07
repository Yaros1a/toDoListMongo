const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-yarik:a9SNe5SHH9uuorIL@cluster0.a9iqyfn.mongodb.net/todolistDB")

const itemsSchema = new mongoose.Schema({
  name: String
}) 
const Item = mongoose.model("Item", itemsSchema) 

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

let defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

let items = defaultItems;
async function findEl() {
  try {
    items = await Item.find({})
    // mongoose.connection.close()
  } catch (error) {
    console.error(error.message)
  }
}


app.get("/", async function(req, res) {
  
  const day = date.getDate();
  await findEl()
  if (items.length === 0){
    Item.insertMany(defaultItems)
    res.redirect("/")
  } else {
    res.render("list", {listTitle: "Today", newListItems: items});
  }
});

app.post("/", async function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  if (itemName.length !== 0) {
    const newItem = new Item ({
      name: itemName
    })
    if(listName === "Today") {
      newItem.save()
      res.redirect("/");
    } else {
    const lName = await List.findOne({name: listName})
    lName.items.push(newItem)
    lName.save()
    res.redirect("/" + listName)
    }
  }
});

app.post("/delete", async (req, res) => {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    try {
        await Item.findByIdAndDelete(checkedItemID)
        } catch (e) {
          console.log(e);
      }
      res.redirect("/")
  } else {
    const foundLIst = await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}})  
    res.redirect("/" + listName)

  }

 
})

app.get("/:customListName", async (req, res) => {
  let listName = _.capitalize(req.params.customListName);
  let checkStart = await List.findOne({name: listName})
  console.log(checkStart)

  if (!checkStart) {
    console.log(checkStart)
    const list = new List({
      name: listName,
      items: defaultItems
    })
    console.log("Saved!!!")
    await list.save()
    res.redirect("/" + listName)
  } else {
    let day = date.getDate();
    res.render("list", {listTitle: checkStart.name, newListItems: checkStart.items})
  }
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
