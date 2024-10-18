let palavraSecreta = '';
let dica = '';
let palavraDisplay = [];
let tentativas = 0;
let acertos = 0;
const maxTentativas = 6;

async function buscarPalavra() {
  
  const resposta = await fetch('https://api.dicionario-aberto.net/random');
  const dados = await resposta.json();
  
  palavraSecreta = dados.word.toUpperCase();
  console.log(palavraSecreta);
  dica = dados.word.substring(0, 1).toUpperCase();

  
  palavraSecreta = normalizarPalavra(palavraSecreta);

  inicializarJogo();
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
  tentativas = 0;  // Reinicia as tentativas
  acertos = 0;
  atualizarTentativasRestantes();
}

function atualizarPalavraDisplay() {
  document.getElementById('palavra').innerText = palavraDisplay.join(' ');
}

function criarTecladoVirtual() {
  const teclado = document.getElementById('teclado');
  teclado.innerHTML = '';
  
  
  const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÇ';
  alfabeto.split('').forEach(letra => {
    const tecla = document.createElement('div');
    tecla.classList.add('tecla', 'bg-gray-200', 'hover:bg-gray-400', 'text-lg', 'p-3', 'rounded', 'cursor-pointer');
    tecla.innerText = letra;
    tecla.onclick = () => tentarLetra(letra);
    teclado.appendChild(tecla);
  });
}

function tentarLetra(letra) {
  const letraNormalizada = normalizarPalavra(letra);
  
  if (palavraSecreta.includes(letraNormalizada)) {
    for (let i = 0; i < palavraSecreta.length; i++) {
      if (palavraSecreta[i] === letraNormalizada) {
        palavraDisplay[i] = letra;
        acertos++;
      }
    }
  } else {
    tentativas++;
    atualizarTentativasRestantes();
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
    bloquearTeclado();
  } else if (acertos === palavraSecreta.length) {
    mensagem.innerText = 'Você ganhou!';
    bloquearTeclado();
  }
}

function bloquearTeclado() {
  const teclas = document.getElementsByClassName('tecla');
  for (let tecla of teclas) {
    tecla.onclick = null;
  }
}

function reiniciar() {
  document.getElementById('mensagem').innerText = '';
  buscarPalavra();
}

buscarPalavra();