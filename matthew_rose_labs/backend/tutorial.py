
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

"""
3 types of parameters that we can send
1. query (formal params, http://127.0.0.1:8000/items?limit=5, def func(limit:int)) searches the URl param by key and extracts value)
2. path ( http://127.0.0.1:8000/items/2) @app.get("/items/{item_id}")
3. body params: send a json object via path request 
an endpoint --> exit or entry, where the server returns the service 

A request is your frontend (React, browser, etc.) talking to your backend (FastAPI).
1. url: where we send the request 
2. headers: specify what type of object/data is sent
3. body: the actual data

EXAMPLE! 
async function sendItem() {
  const res = await fetch("http://127.0.0.1:8000/items", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ text: "Buy pizza", is_done: false })
  });

  const data = await res.json();   // wait until it's converted to JSON
  console.log(data);               // use the JSON result
}

3 DIFFERENT HELPERS FROM FASTAPI: These helpers specify from where in the request is the data coming from
Query() = URL filter
Body() = JSON data 
Form() = HTML form fields

"""

#BaseModel enforces that the object has required values in the specified data format
class Item(BaseModel):
    text: str = None
    is_done: bool = False


items = []


@app.get("/")
def root():
    return {"Hello": "World"}


@app.post("/items")
def create_item(item: Item):
    items.append(item)
    return items

#response model indicates the object type returned by the endpoint 
@app.get("/items", response_model=list[Item])
def list_items(limit: int = 10):
    return items[0:limit]


@app.get("/items/{item_id}", response_model=Item)
def get_item(item_id: int) -> Item:
    if item_id < len(items):
        return items[item_id]
    else:
        raise HTTPException(status_code=404, detail=f"Item {item_id} not found")