const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const mouthImage = new Image();
mouthImage.src = "smile.png";

const mouthWidth = 100; // Largura da boca (tamanho original da imagem)
const mouthHeight = 100; // Altura da boca (tamanho original da imagem)

// Frases iniciais (pode adicionar mais frases conforme necessário)
let phrases = [
    "Hello, how are you?",
    "Have a nice day!",
    "Coding is fun!",
    "Keep learning!",
    "Enjoy the game!"
];



let mouthX = canvas.width / 2 - mouthWidth / 2;
const mouthY = canvas.height - mouthHeight;

let rightPressed = false;
let leftPressed = false;

let capturedPhrase = null; // Variável para armazenar a frase capturada
let capturedPhrases = []; // Alterado para armazenar múltiplas frases capturadas
let capturedTime = null; // Variável para armazenar o tempo em que a frase foi capturada
let lastCapturedTime = null;
let lastCaptureTime = 0; // Variável para armazenar o tempo da última captura de frase


const PHRASE_TIMEOUT = 7000; // 7 seconds (adjust as needed)


document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        mouthX = relativeX - mouthWidth / 2;
    }
    // Uncomment the following line to always capture phrase on mouse move
    // checkCollision();
}


function drawMouth() {
    ctx.drawImage(mouthImage, mouthX, mouthY, mouthWidth, mouthHeight);
}


function moveMouth() {
    if (rightPressed && mouthX < canvas.width - mouthWidth) {
        mouthX += 7;
    } else if (leftPressed && mouthX > 0) {
        mouthX -= 7;
    }
}

// Função para inicializar as frases com valores de posição aleatórios
function initializePhrases() {
    phrases = phrases.map(phrase => {
        return {
            text: phrase,
            x: Math.random() * (canvas.width - 100),
            y: Math.random() * (canvas.height - 100)
        };
    });
}


function drawPhrases() {
    ctx.fillStyle = "#000"; // Cor do texto
    ctx.font = "50px Arial"; // Fonte e tamanho do texto
    phrases.forEach(phrase => {
        ctx.fillText(phrase, phrase.x, phrase.y);
    });
}


function movePhrases() {
    phrases.forEach((phrase, index) => {
        // Movendo as frases em incrementos menores
        for (let i = 0; i < 5; i++) {
            phrase.y += 0.2; // Ajuste a velocidade conforme necessário

            // Verificar colisão em cada incremento
            if (
                mouthX < phrase.x + mouthWidth &&
                mouthX + mouthWidth > phrase.x &&
                mouthY < phrase.y + mouthHeight - 30 &&
                mouthY + mouthHeight - 30 > phrase.y
            ) {
                // Colisão detectada, capturar a frase
                capturedPhrase = phrase;
                lastCapturedTime = Date.now(); // Atualizar o tempo da última captura
                phrases.splice(index, 1);
                break; // Sair do loop para evitar capturar a mesma frase várias vezes
            }
        }

        // Verificar se a frase atingiu a parte inferior do canvas
        if (phrase.y > canvas.height) {
            phrases[index] = generateRandomPhrase();
            phrase.y = -30;
            phrase.x = Math.random() * (canvas.width - 100);
        }
    });
}



function checkCollision() {
    phrases.forEach((phrase, index) => {
        // Calcula as coordenadas dos retângulos de colisão da boca e da frase
        const mouthRect = {
            x: mouthX,
            y: mouthY,
            width: mouthWidth,
            height: mouthHeight
        };

        const phraseRect = {
            x: phrase.x,
            y: phrase.y,
            width: ctx.measureText(phrase.text).width,
            height: 50 // Altura do texto da frase
        };

        // Calcula a área de intersecção entre os retângulos
        const intersectionX = Math.max(0, Math.min(mouthRect.x + mouthRect.width, phraseRect.x + phraseRect.width) - Math.max(mouthRect.x, phraseRect.x));
        const intersectionY = Math.max(0, Math.min(mouthRect.y + mouthRect.height, phraseRect.y + phraseRect.height) - Math.max(mouthRect.y, phraseRect.y));
        const intersectionArea = intersectionX * intersectionY;

        // Verifica se a área de intersecção é significativa
        const minIntersectionArea = Math.min(mouthRect.width * mouthRect.height, phraseRect.width * phraseRect.height) * 0.1; // 10% da área mínima entre os retângulos
        if (intersectionArea >= minIntersectionArea) {
            capturedPhrase = phrase; // Update the capturedPhrase with the new phrase
            lastCapturedTime = Date.now(); // Update the capture time
            phrases.splice(index, 1);
        }
    });
}

function drawSpeechBalloon() {
    const currentTime = Date.now();
    const timeSinceCapture = currentTime - lastCapturedTime;

    if (capturedPhrase && (timeSinceCapture < PHRASE_TIMEOUT || timeSinceCapture === 0)) {
        // Calculate the width of the text
        const textWidth = ctx.measureText(capturedPhrase.text).width;
        // Set the balloon width to the text width plus some padding
        const balloonWidth = textWidth + 20; // Adjust padding as needed
        const balloonHeight = 40; // Altura do balão de fala
        const balloonX = canvas.width / 2 - balloonWidth / 2; // Posição horizontal do balão de fala
        const balloonY = 10; // Posição vertical do balão de fala

        // Desenhar o corpo do balão de fala
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(balloonX, balloonY, balloonWidth, balloonHeight);

        // Desenhar a ponta do balão de fala
        ctx.beginPath();
        ctx.moveTo(balloonX + 10, balloonY + balloonHeight);
        ctx.lineTo(balloonX + 20, balloonY + balloonHeight + 10);
        ctx.lineTo(balloonX + 30, balloonY + balloonHeight);
        ctx.closePath();
        ctx.fill();

        // Desenhar o texto dentro do balão de fala
        ctx.fillStyle = "#000000";
        ctx.fillText(capturedPhrase.text, balloonX + 10, balloonY + 25);
    }
}



function generateRandomPhrase() {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMouth();
    drawPhrases();
    moveMouth();
    movePhrases();
    checkCollision();
    drawSpeechBalloon(); // Adicionando a chamada para desenhar o balão de fala
    requestAnimationFrame(draw);
}



initializePhrases(); // Inicializar as frases com valores de posição aleatórios
draw(); // Iniciar o jogo
