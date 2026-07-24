const statNames = [
    "STR",
    "AGI",
    "INT",
    "VIT"
];

let remaining = 10;

const stats = {};

const statContainer = document.getElementById("stats");

statNames.forEach(name=>{

    stats[name]=0;

    const row=document.createElement("div");

    row.className="stat";

    row.innerHTML=`
        <span>${name}</span>

        <button class="minus">-</button>

        <div class="bar">
            <div class="fill"></div>
        </div>

        <button class="plus">+</button>
    `;

    const minus=row.querySelector(".minus");
    const plus=row.querySelector(".plus");
    const fill=row.querySelector(".fill");

    plus.onclick=()=>{

        if(remaining==0) return;

        stats[name]++;

        remaining--;

        fill.style.width=(stats[name]*10)+"%";

        refresh();
    }

    minus.onclick=()=>{

        if(stats[name]==0) return;

        stats[name]--;

        remaining++;

        fill.style.width=(stats[name]*10)+"%";

        refresh();
    }

    statContainer.appendChild(row);

});

function refresh(){

    document.getElementById("remaining").innerText=remaining;

    const btn=document.getElementById("createBtn");

    if(remaining==0){

        btn.disabled=false;

        btn.classList.add("enabled");

        btn.innerText="Create Character";

    }else{

        btn.disabled=true;

        btn.classList.remove("enabled");

        btn.innerText="Spend All Points";
    }

    updateSummary();

}

document.getElementById("charName").oninput=e=>{

    document.getElementById("previewName").innerText=
        e.target.value || "Unnamed Hero";

}

document.getElementById("classSelect").onchange=e=>{

    document.getElementById("previewClass").innerText=e.target.value;

    updateSummary();

}

function updateSummary(){

    const cls=document.getElementById("classSelect").value;

    let hp=100;

    let atk=10;

    let def=10;

    let spd=10;

    switch(cls){

        case "Warrior":
            hp+=50;
            atk+=10;
            def+=5;
            break;

        case "Mage":
            atk+=20;
            break;

        case "Archer":
            spd+=15;
            atk+=8;
            break;

        case "Assassin":
            spd+=20;
            atk+=12;
            break;
    }

    hp+=stats.VIT*20;

    atk+=stats.STR*3;

    def+=stats.VIT*2;

    spd+=stats.AGI*3;

    atk+=stats.INT*2;

    document.getElementById("sumHP").innerText=hp;
    document.getElementById("sumATK").innerText=atk;
    document.getElementById("sumDEF").innerText=def;
    document.getElementById("sumSPD").innerText=spd;

}

document.querySelectorAll(".gender-btn").forEach(btn=>{

    btn.onclick=()=>{

        document.querySelectorAll(".gender-btn")
            .forEach(x=>x.classList.remove("active"));

        btn.classList.add("active");

    }

});

refresh();