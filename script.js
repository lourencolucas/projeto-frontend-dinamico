let palavraSecreta = ''; 
let dica = ''; 
let palavraDisplay = []; 
let tentativas = 0; 
let acertos = 0; 
let letrasUsadas = []; 
const maxTentativas = 6;

const openModalBtn = document.getElementById('openModal');
const closeModalBtn = document.getElementById('closeModal');
const modal = document.getElementById('modal');

openModalBtn.addEventListener('click', () => {
  modal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

function salvarEstatisticas(vitoria) { 
    let estatisticas = JSON.parse(localStorage.getItem('estatisticas')) || { vitorias: 0, derrotas: 0, totalJogos: 0 }; 
    estatisticas.totalJogos++; 
    if (vitoria) { 
        estatisticas.vitorias++; 
    } else { 
        estatisticas.derrotas++; 
    } 
    localStorage.setItem('estatisticas', JSON.stringify(estatisticas)); 
    carregarEstatisticas(); 
}

function carregarEstatisticas() { 
    let estatisticas = JSON.parse(localStorage.getItem('estatisticas')) || { vitorias: 0, derrotas: 0, totalJogos: 0 }; 
    document.getElementById('estatisticas').innerText = `Vitórias: ${estatisticas.vitorias}, Derrotas: ${estatisticas.derrotas}, Total de Jogos: ${estatisticas.totalJogos}`; 
}

async function buscarPalavra() { 
    try { 
        const resposta = await fetch('http://localhost:3000/forca'); 
        const dados = await resposta.json(); 
        const palavraAleatoria = dados[Math.floor(Math.random() * dados.length)]; 
        palavraSecreta = palavraAleatoria.palavra.toUpperCase(); 
        dica = palavraAleatoria.dica; 
        console.log(palavraSecreta); 
        palavraSecreta = normalizarPalavra(palavraSecreta); 
        inicializarJogo(); 
    } catch (erro) { 
        console.error('Erro ao buscar a palavra:', erro); 
        document.getElementById('mensagem').innerText = 'Erro ao carregar a palavra. Tente novamente.'; 
    } 
}

function normalizarPalavra(palavra) { 
    return palavra
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[-]/g, "")
        .replace(/Ç/g, "C")
        .replace(/Â/g, "A"); 
}

function inicializarJogo() { 
    document.getElementById('dicaTexto').innerText = dica; 
    palavraDisplay = Array(palavraSecreta.length).fill('_'); 
    atualizarPalavraDisplay(); 
    criarTecladoVirtual(); 
    tentativas = 0; 
    acertos = 0; 
    letrasUsadas = []; 
    atualizarTentativasRestantes(); 
    atualizarLetrasUsadas(); 
}

function atualizarPalavraDisplay() { 
    document.getElementById('palavra').innerText = palavraDisplay.join(' '); 
}

function criarTecladoVirtual() { 
    const teclado = document.getElementById('teclado'); 
    teclado.innerHTML = ''; 
    const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÇ'; 
    alfabeto.split('').forEach(letra => { 
        const tecla = document.createElement('button'); 
        tecla.classList.add('tecla', 'bg-gray-200', 'hover:bg-gray-400', 'text-lg', 'p-3', 'rounded', 'cursor-pointer'); 
        tecla.innerText = letra; 
        tecla.onclick = () => tentarLetra(letra, tecla); 
        teclado.appendChild(tecla); 
    }); 
}

function tentarLetra(letra, tecla) { 
    const letraNormalizada = normalizarPalavra(letra); 
    if (!letrasUsadas.includes(letra)) { 
        letrasUsadas.push(letra); 
        atualizarLetrasUsadas(); 
        if (palavraSecreta.includes(letraNormalizada)) { 
            for (let i = 0; i < palavraSecreta.length; i++) { 
                if (palavraSecreta[i] === letraNormalizada) { 
                    palavraDisplay[i] = letra; 
                    acertos++; 
                } 
            } 
            tecla.style.backgroundColor = 'green'; 
        } else { 
            tentativas++; 
            atualizarTentativasRestantes(); 
            tecla.style.backgroundColor = 'red'; 
        } 
        tecla.disabled = true; 
    } 
    verificarFimDeJogo(); 
    atualizarPalavraDisplay(); 
}

function atualizarTentativasRestantes() { 
    const tentativasRestantes = maxTentativas - tentativas; 
    document.getElementById('tentativasRestantes').innerText = tentativasRestantes; 
}

function verificarFimDeJogo() { 
    const mensagem = document.getElementById('mensagem'); 
    if (tentativas >= maxTentativas) { 
        mensagem.innerText = 'Você perdeu! A palavra era: ' + palavraSecreta; 
        salvarEstatisticas(false); 
        bloquearTeclado(); 
    } else if (acertos === palavraSecreta.length) { 
        mensagem.innerText = 'Você ganhou!'; 
        salvarEstatisticas(true); 
        bloquearTeclado(); 
        confetti({
            particleCount: 500,   
            spread: 70,           
            origin: { y: 0.6 },  
        });
    } 
}

function bloquearTeclado() { 
    const teclas = document.getElementsByClassName('tecla'); 
    for (let tecla of teclas) { 
        tecla.onclick = null; 
    } 
}

function atualizarLetrasUsadas() { 
    document.getElementById('letrasUsadas').innerText = letrasUsadas.join(', '); 
}

function reiniciar() { 
    document.getElementById('mensagem').innerText = ''; 
    buscarPalavra(); 
}

function chutarPalavra() {
    // let chute = prompt("Digite sua palavra: ").toUpperCase();
    let palavra = document.getElementById('word');
    let chute = palavra.value.toUpperCase();
    
    const chuteNormalizado = normalizarPalavra(chute);
    
    if (chuteNormalizado === palavraSecreta) {
        document.getElementById('mensagem').innerText = 'Você acertou a palavra completa!';
        palavraDisplay = chute.split('');
        acertos = palavraSecreta.length;
        verificarFimDeJogo();
    } else {
        tentativas++;
        atualizarTentativasRestantes();
        document.getElementById('mensagem').innerText = 'Chute incorreto, tente novamente.';
        verificarFimDeJogo();
    }
}

document.addEventListener('DOMContentLoaded', function() { 
    carregarEstatisticas(); 
    buscarPalavra(); 
});
