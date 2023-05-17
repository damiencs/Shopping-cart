async function fetchList() {
  const res = await fetch("http://localhost:3000/items", { method: "GET" });
  const data = await res.json();
  const shoppingList = document.getElementById("container");
  for (let i = 0; i < data.length; ++i) {
    const div = createDiv(data[i]);
    shoppingList.appendChild(div);
  }
  
  const cart = JSON.parse(localStorage.getItem("cart"));
    if (!cart) {
      localStorage.setItem("cart", "{}");
    }
}

function createDiv(item){
  const div = document.createElement("DIV");
  const id = item.id;
  const btnName = "btnAdd"+id;
  div.id = item.id;
  div.className = "shoppingListItem rounded bg-white border-stone-900 shadow-2xl overflow-hidden";
  div.innerHTML = `
    <img src="images/${item.name}.jpeg" style="height:300px; width:300px" />
    <text>${item.name}</text>
    <text><br>${item.description}<br></text>
    <text>Price: $${item.price}<br></text>
    <button type="button" class = "bg-[#1da1f2] text-black font-bold py-2 px-4 rounded-full" id="${btnName}" onClick="addToCart(${item.id}, '${item.name}', ${item.stock - 1})">Add to shopping cart</button>`;
    checkStock(id);
    return div;
}

async function addToCart(id, itemName, newStock){
  const res = await fetch("http://localhost:3000/items/" + id, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      stock: newStock,
    }),
  });
  const data = await res.json();
  replaceDiv(data);
  
  const first = addToCartStorage(itemName);
  updateAfterAddToCart(first,id,itemName); 
}

function updateShoppingList(){
  let count = 0;
  const cart = JSON.parse(localStorage.getItem("cart"));
  for (const key of Object.keys(cart)) {
    count = count + cart[key];
  }
  document.getElementById("totalAmount").innerText = "Total Amount: $"+count*100;
  document.getElementById("itemCount").innerText = count;
  document.getElementById("noOfItems").innerText = "Number of Items: "+count;
}

function createModal(id,itemName) {
  const cart = JSON.parse(localStorage.getItem("cart"));
  const modal = document.getElementById("data");
  
  for (const key of Object.keys(cart)) {
    if(itemName === key){
      const divID = "div"+id;
      const textName = "numItems"+id;
      const div = document.createElement("DIV");
      div.id = divID;
      div.innerHTML = `
      <td><img src="images/${key}.jpeg" style="height:50px; width:50px"</td>
      <td><text>${key}</text></td>
      <td><text id = "${textName}">${cart[key]}</text></td>
      <button id="btnDelete" onClick = "deleteFromCart(${id},'${key}')"><i class="fa fa-trash"></i></button>`;
      modal.appendChild(div);
    }
  }
}

function updateModal(id,itemName,isDelete){
  const cart = JSON.parse(localStorage.getItem("cart"));
  if(isDelete){
    if(cart[itemName] == 0){
      document.getElementById("div"+id).remove();
    }else{
      document.getElementById("numItems"+id).innerText = cart[itemName];
    }
  }else{
    document.getElementById("numItems"+id).innerText = cart[itemName];
  }
}

async function deleteFromCart(id, itemName){
  const isDelete = true;
  const ress = await fetch("http://localhost:3000/items", { method: "GET" });
  const data = await ress.json();
  for(let i = 0; i<data.length;i++){
    if(data[i].id == id){
      newStock = data[i].stock + 1;
    }
  }

  const res = await fetch("http://localhost:3000/items/" + id, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      stock: newStock,
    }),
  });
  
  removeFromCart(itemName);
  updateModal(id,itemName,isDelete);
  updateShoppingList();
}

function removeFromCart(itemName){
  const cart = JSON.parse(localStorage.getItem("cart"));
  for (const key of Object.keys(cart)) {
    if(itemName === key){
      cart[key] = cart[key] -1;
    }
  }
  localStorage.setItem("cart", JSON.stringify(cart));
}

async function checkStock(id){
  const res = await fetch("http://localhost:3000/items", { method: "GET" });
  const data = await res.json();
  for(let i = 0;i<data.length; ++i){
    if(data[i].id == id){
      if(data[i].stock <= 0){
        const btnname = "btnAdd"+id; 
        document.getElementById(btnname).disabled = true;
        document.getElementById(btnname).innerText = "Out of stock";
      } 
      break;
    }
  }
}

function replaceDiv(data){
  const shoppingListDiv = document.getElementById("container");
  shoppingListDiv.childNodes.forEach((childNode) => {
    if (childNode.id == data.id) {
      childNode.replaceWith(createDiv(data));
    }
  });
}

function updateAfterAddToCart(first,id,itemName){
  if(first){
    createModal(id,itemName);
  }else{
    updateModal(id,itemName);
  }
  updateShoppingList();
  checkStock(id);
}

function addToCartStorage(itemName){
  const cart = JSON.parse(localStorage.getItem("cart"));
  let first = true;
  if (cart[itemName]) {
    cart[itemName] += 1;
    first = false
  } else {
    first = true;
    cart[itemName] = 1;
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  return first;
}

fetchList();