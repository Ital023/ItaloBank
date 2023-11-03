let transactions = [];

function createEditTransaction(transaction){
    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-btn");
    editBtn.textContent = "Editar";
    editBtn.addEventListener("click",()=>{
        document.querySelector("#id").value = transaction.id;
        document.querySelector("#name").value = transaction.name;
        document.querySelector("#amount").value = transaction.amount;
    })
    return editBtn;
}

function createTransactionContainer(id){
    const container = document.createElement("div");
    container.classList.add("transaction");
    container.id = `transaction-${id}`;
    return container;
}

function createTransactionTitle(name){
    const title = document.createElement("span");
    title.classList.add("transaction-title");
    title.textContent = name;
    return title;
}

function createDeleteTransactionBtn(id){
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "Excluir";
    deleteBtn.addEventListener("click",async ()=>{
        await fetch(`http://localhost:3000/transactions/${id}`,{method: "DELETE"});
        deleteBtn.parentElement.remove();
        const indexToRemove = transactions.findIndex((t)=> t.id === id);
        transactions.splice(indexToRemove,1);
        updateBalance();
    })
    return deleteBtn;
}

function createTransactionAmount(amount){
    const span = document.createElement("span");

    const formater = Intl.NumberFormat("pt-BR",{
        compactDisplay: "long",
        currency: "BRL",
        style: "currency"
    })

    const formatedAmount = formater.format(amount);

    if(amount > 0){
        span.textContent = ` ${formatedAmount} C`
        span.classList.add("credit");
    }else{
        span.textContent = ` ${formatedAmount} D`
        span.classList.add("debit");
    }
    return span;
}

function renderTransaction(transaction){
    const container = createTransactionContainer(transaction.id);
    const title = createTransactionTitle(transaction.name);
    const amount = createTransactionAmount(transaction.amount);
    const editBtn = createEditTransaction(transaction);
    const deleteBtn = createDeleteTransactionBtn(transaction.id);

    container.append(title,amount,editBtn,deleteBtn);
    document.querySelector("#transactions").append(container);
}

function updateBalance(){
    const balanceSpan = document.querySelector("#balance");
    const balance = transactions.reduce((sum,transactions) => sum + transactions.amount,0);
    const formater = Intl.NumberFormat("pt-BR",{
        compactDisplay: "long",
        currency: "BRL",
        style: "currency"
    })
    balanceSpan.textContent = formater.format(balance);
}

async function saveTransaction(ev){
    ev.preventDefault();

    const id = document.querySelector("#id").value;
    const name = document.querySelector("#name").value;
    const amount = parseFloat(document.querySelector("#amount").value);

    if(id){
        const response = await fetch(`http://localhost:3000/transactions/${id}`,{
            method: "PUT",
            body: JSON.stringify({name,amount}),
            headers:{
                "Content-Type": "application/json"
            }
        })
        document.querySelector("#id").value = "";
        const transaction = await response.json();
        const indexToRemove = transactions.findIndex((t)=> t.id === id);
        transactions.splice(indexToRemove,1,transaction);
        document.querySelector(`#transaction-${id}`).remove();
        renderTransaction(transaction);

    }else{
        const response = await fetch("http://localhost:3000/transactions",{
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify({name,amount})
    })

        const transaction = await response.json();
        transactions.push(transaction);
        renderTransaction(transaction);
    }

    ev.target.reset();
    updateBalance();
}

async function fetchTransactions(){
    return await fetch("http://localhost:3000/transactions").then(res => res.json());
}

async function setup(){
    const results = await fetchTransactions();
    transactions.push(...results);
    transactions.forEach(renderTransaction);
    updateBalance();
}

function themeSwitch(){
    const root = document.querySelector(":root");
    const main = document.querySelector("main");

    if(main.dataset.theme === "light"){
        root.style.setProperty("--bg-color","#39353b");
        root.style.setProperty("--texto","#ECE3CE");
        main.dataset.theme = "dark";
    }else{
        root.style.setProperty("--bg-color","#ECE3CE");
        root.style.setProperty("--texto","#39353b");
        main.dataset.theme = "light";
    }

}


document.addEventListener("DOMContentLoaded",setup);
document.querySelector("form").addEventListener("submit",saveTransaction);
document.querySelector(".btn-theme").addEventListener("click",themeSwitch);