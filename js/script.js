var guardaFotos = [];
var gerar = true;
var verErros = document.getElementById("verErros");
var questions;

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn_gerador').style.display = "none";
    document.getElementById('title-form-group').style.display = "none";
    document.getElementById('convertToHtml').addEventListener('click', transformToSingleLine);
    document.getElementById('colocaLetras').addEventListener('click', colocaLetras);
    document.getElementById('colocaFeedback').addEventListener('click', PalavraFeedback);
    document.getElementById('selecionarImagem').addEventListener('click', selecionarImagem);
    document.getElementById('convertToItalico').addEventListener('click', Italico);
    document.getElementById('convertToNegrito').addEventListener('click', Negrito);
    document.getElementById('verificaQuestoes').addEventListener('click', verificaquestoes);
    document.getElementById('btn_gerador').addEventListener('click', generateQti);

    document.getElementById('title').addEventListener('keyup', salvarLocalStorage);
    document.getElementById('questions').addEventListener('keyup', salvarLocalStorage);
});


function generateQti() {

    var zip = new JSZip();
    var pasta_images = zip.folder("images");
    var qtiFolder = zip.folder("qti21");
    zip.folder("csfiles").folder("home_dir");

    var title = document.getElementById("title").value;
    //var title_questao = document.getElementById("title_question").value;

    gerar = true;

    // Generate assessmentItem files and build assessmentItemRef elements
    var assessmentItemRefs = '';

    let nameimagens = [];

    //QUESTÕES INDIVIDUAIS -------------------------------------------------------------------------------------------------
    //console.log(questions);
    for (var i = 0; i < questions.length; i++) {
        //question = questions[i].trim().split("\n");
        question = questions[i];
        //console.log(question);
        //['PERGUNTA', 'RESP1', '*RESP2', 'RESP3', 'RESP4', 'RESP5', 'FEEDBACK: resposta correta']


        //console.log(question);

        //CONTANDO E IDENTIFICANDO AS IMAGENS ----------------------------------------------------------------------------------
        let imagens = [];
        //console.log("question.length: "+question.length); //question.length: 7
        //console.log("question: "+question); //question: PERGUNTA,RESP1,*RESP2,RESP3,RESP4,RESP5,FEEDBACK: resposta "RESP2" correta
        for (let j = 0; j < question.length; j++) {

            if (typeof question[j] === 'string' && question[j].includes('<img')) {

                const regex = /<img.*?src="(.*?)".*?\/?>/g; //AQUI É SÓ O METODO
                const matches = question[j].match(regex); //PEGA O METODO REGEX E LIMPA O TEXTO
                //console.log(matches)//['<img src="img_00001.png">', '<img src="img_00002.png">']

                if (matches) {
                    matches.forEach(match => {
                        let nomeImagem = match.match(/src="(.*?)"/)[1];
                        //console.log("nomeImagem: "+nomeImagem);//nomeImagem: img_00001.png (ele pega todos que estiver no texto)

                        for (let k = 0; k < guardaFotos.length; k++) {
                            //console.log("guardaFotos: "+guardaFotos[k] +" \n\n");//[img_00001.png, data:image/jpe ]
                            //console.log("Vai Encontrar? " + nomeImagem + " " + guardaFotos[k][0]);
                            nomeImagem = nomeImagem.replace("../images/", "");
                            if (nomeImagem == guardaFotos[k][0]) {
                                //console.log("Encontrou: " + nomeImagem + " " + guardaFotos[k][0]); // Encontrou: img_00001.png img_00001.png
                                imagens.push(nomeImagem);
                                //console.log("imagens: " + imagens); // Encontrou: img_00001.png img_00001.png
                            }
                        }

                    })
                }

            }

        }

        nameimagens.push(imagens);


        //ADICIONAR NO ZIP
        //guardaFotos[]
        //encontre a imagem com esse nome no array, se tem adiciona na pasta do zip

        for (var b = 0; b < nameimagens.length; b++) {
            //console.log("nameimagens: ",nameimagens);

            for (var c = 0; c < nameimagens[b].length; c++) {
                //console.log("nameimagens[c]: ",nameimagens[b][c]);
                var encontrouImg = false;
                //console.log(guardaFotos); //[Array[nome, base64], Array[nome, base64]]
                for (var a = 0; a < guardaFotos.length; a++) {
                    //console.log("GuardaFotos: ",guardaFotos.length);
                    if (nameimagens[b][c] == guardaFotos[a][0]) {
                        //console.log(nameimagens[b][c]+ " == " +guardaFotos[a][0]);
                        pasta_images.file(guardaFotos[a][0], guardaFotos[a][1].split(",")[1], { base64: true });
                        encontrouImg = true;
                    }
                }

                if (!encontrouImg) {
                    verErros.innerHTML += "Questão " + (b + 1) + ": Não encontrou a imagem, recolocar pelo botão (IMAGEM)<br/>";
                    gerar = false;

                    //PINTA A QUESTÃO COM IMAGEM FALTANTE
                    var divQ = document.getElementById('container' + b);//div.id = 'container'+i;
                    if (divQ) {
                        divQ.style.backgroundColor = "#ffa1a1";
                    }
                }
            }
        }
        //console.log('Imagens encontradas:', nameimagens);




        var feedback = "";
        var responses;

        //VERIFICA SE TEM FEEDBACK NOS PRIMEIROS 8 CARACTERES
        var t = question[question.length - 1].split(' ')[0].substring(0, 8);
        //console.log("t="+t);
        if (t == "FEEDBACK" || t == "Feedback" || t == "feedback") {

            feedback = question[question.length - 1] ? question[question.length - 1].replace(/FEEDBACK: /gi, "").replace(/FEEDBACK. /gi, "").replace(/FEEDBACK /gi, "") : "";
            //console.log(feedback);

            responses = question.slice(2, question.length - 1);//SOMENTE AS ALTERNATIVAS. SEM O TÍTULO, O ENUNCIADO E O FEEDBACK

        } else {
            responses = question.slice(2, question.length);//SOMENTE AS ALTERNATIVAS. SEM O TÍTULO E O ENUNCIADO
        }

        console.log("Respostas:" + responses);

        console.log("NUMERO ALTERNATIVA CORRETA:" + responses.findIndex((response) => response.includes("*")));



        var identifier = `assessmentItem${String(i + 1).padStart(5, '0')}`;
        var assessmentItemFileName = `${identifier}.xml`;


        var xmlString = `<?xml version='1.0' encoding='UTF-8'?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" xmlns:ns9="http://www.imsglobal.org/xsd/apip/apipv1p0/imsapip_qtiv1p0" xmlns:ns8="http://www.w3.org/1999/xlink" title="" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd" adaptive="false" timeDependent="false" identifier="QUE_${String(i + 1).padStart(5, '0')}">
    <responseDeclaration cardinality="single" baseType="identifier" identifier="RESPONSE">
        <correctResponse>
            <value>answer_${1 + responses.findIndex((response) => response.includes("*"))}</value>
        </correctResponse>
    </responseDeclaration>
    <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
        <defaultValue>
            <value>0</value>
        </defaultValue>
    </outcomeDeclaration>
    <outcomeDeclaration identifier="FEEDBACKBASIC" cardinality="single" baseType="identifier"/>
    <outcomeDeclaration identifier="MAXSCORE" cardinality="single" baseType="float">
        <defaultValue>
            <value>0</value>
        </defaultValue>
    </outcomeDeclaration>
    <itemBody>
        <div>
            <div>
                ${question[1]}
                
            </div>
        </div>
        <choiceInteraction responseIdentifier="RESPONSE" maxChoices="1" shuffle="false">`
        //for (var j = 2; j < question.length-1; j++) { 

        var n_alt = feedback == "" ? question.length : question.length - 1;
        //console.log("feedback: "+feedback + " | n_alt: "+n_alt);

        for (var j = 2; j < n_alt; j++) {
            var choice = question[j].replace('*', '');
            xmlString += `<simpleChoice identifier="answer_${j - 1}" fixed="true">
                    ${choice}
                </simpleChoice>`;
        }
        xmlString += `</choiceInteraction>
    </itemBody>
    <responseProcessing>
        <responseCondition>
            <responseIf>
                <match>
                    <variable identifier="RESPONSE"/>
                    <correct identifier="RESPONSE"/>
                </match>
                <setOutcomeValue identifier="SCORE">
                    <variable identifier="MAXSCORE"/>
                </setOutcomeValue>
                <setOutcomeValue identifier="FEEDBACKBASIC">
                    <baseValue baseType="identifier">correct_fb</baseValue>
                </setOutcomeValue>
            </responseIf>
            <responseElse>
                <setOutcomeValue identifier="FEEDBACKBASIC">
                    <baseValue baseType="identifier">incorrect_fb</baseValue>
                </setOutcomeValue>
            </responseElse>
        </responseCondition>
    </responseProcessing>
    <modalFeedback showHide="show" outcomeIdentifier="FEEDBACKBASIC" identifier="correct_fb">
        <div>
            <div>
                ${feedback}
            </div>
        </div>
    </modalFeedback>
    <modalFeedback showHide="show" outcomeIdentifier="FEEDBACKBASIC" identifier="incorrect_fb">
        <div>
            <div>
                ${feedback}
            </div>
        </div>
    </modalFeedback>
</assessmentItem>`;

        //console.log(xmlString);
        // var qtiFolder = zip.folder("qti21");
        qtiFolder.file(assessmentItemFileName, xmlString);

        assessmentItemRefs += `<assessmentItemRef identifier="${identifier}" href="${assessmentItemFileName}" />\n`;
    }



    //BANCO DE QUESTÕES -------------------------------------------------------------------------------------------------
    // Generate question_bank00001.xml
    var questionBankXml = `<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd" identifier="question_bank00001" title="${title}">
    <testPart identifier="question_bank00001_1" navigationMode="nonlinear" submissionMode="simultaneous">
        <assessmentSection identifier="question_bank00001_1_1" visible="false" title="Section 1">
            ${assessmentItemRefs}
        </assessmentSection>
    </testPart>
</assessmentTest>`;

    // Add qti21/question_bank00001.xml to the qti21 folder
    qtiFolder.file("question_bank00001.xml", questionBankXml);




    //CRIANDO O IMSMANIFEST.XML -------------------------------------------------------------------------------------------------
    // Generate imsmanifest.xml
    var imsManifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="man00001" xmlns="http://www.imsglobal.org/xsd/imscp_v1p1" xmlns:csm="http://www.imsglobal.org/xsd/imsccv1p2/imscsmd_v1p0" xmlns:imsmd="http://ltsc.ieee.org/xsd/LOM" xmlns:imsqti="http://www.imsglobal.org/xsd/imsqti_metadata_v2p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 http://www.imsglobal.org/xsd/imscp_v1p2.xsd http://ltsc.ieee.org/xsd/LOM imsmd_loose_v1p3.xsd http://www.imsglobal.org/xsd/imsqti_metadata_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_metadata_v2p1.xsd http://www.imsglobal.org/xsd/imsccv1p2/imscsmd_v1p0 http://www.imsglobal.org/profile/cc/ccv1p2/ccv1p2_imscsmd_v1p0.xsd">
<metadata><schema>QTIv2.1</schema><schemaversion>2.0</schemaversion></metadata>
<organizations/>
    <resources>`
    for (var i = 0; i < nameimagens.length; i++) {
        for (var j = 0; j < nameimagens[i].length; j++) {
            var img_name = nameimagens[i][j];
            //console.log("ccres0000"+i+"_"+j);
            imsManifestXml += `<resource href="images/${img_name}" identifier="ccres0000${i}_${j}" type="webcontent">  <file href="images/${img_name}"/></resource>`
        }
    }
    imsManifestXml += `<resource href="qti21/question_bank00001.xml" identifier="question_bank00001" type="imsqti_test_xmlv2p1">
            <file href="qti21/question_bank00001.xml"/>
            ${questions.map((_, i) => `<dependency identifierref="assessmentItem${String(i + 1).padStart(5, '0')}"/>`).join("\n")} 
        </resource>`
    for (var i = 0; i < questions.length; i++) {
        imsManifestXml += `<resource href="qti21/assessmentItem${String(i + 1).padStart(5, '0')}.xml" identifier="assessmentItem${String(i + 1).padStart(5, '0')}" type="imsqti_item_xmlv2p1">
                <file href="qti21/assessmentItem${String(i + 1).padStart(5, '0')}.xml"/>`

        for (var i = 0; i < nameimagens.length; i++) {
            for (var j = 0; j < nameimagens[i].length; j++) {
                //console.log("ccres0000"+i+"_"+j);
                imsManifestXml += `<dependency   identifierref="ccres0000${i}_${j}"/>`
            }
        }

        imsManifestXml += `</resource>`
    }
    imsManifestXml += `</resources> 
</manifest>`;

    // Add imsmanifest.xml to the root folder
    zip.file("imsmanifest.xml", imsManifestXml);



    //GERANDO O ZIP -------------------------------------------------------------------------------------------------
    // Generate and save the ZIP file
    /*var content = await zip.generateAsync({ type: "blob" });
    saveAs(content, title+".zip");*/


    if (gerar) {
        // Generate the zip file
        zip.generateAsync({ type: 'blob' })
            .then(function (content) {
                // Save the zip file
                saveAs(content, title + ".zip");
            });
    }
}


//<!-- IMAGEM ------------------------------------------------------------------------------------------------- -->

//ENCONTRAR A IMAGEM E ADICIONAR O CAMINHO E O NOME NO TEXTAREA
function selecionarImagem() {
    const input = document.createElement('input');
    input.type = 'file';

    input.onchange = (event) => {
        const file = event.target.files[0];
        //const file_n = file.name;//retorna Imagem1.png
        const file_n = `img_${String(guardaFotos.length + 1).padStart(5, '0')}.png`;
        //var identifier = `assessmentItem${String(i + 1).padStart(5, '0')}`; código de exemplo
        //console.log(guardaFotos.length);

        const fr = new FileReader();
        fr.readAsDataURL(file);
        fr.addEventListener('load', () => {
            const url = fr.result;
            //console.log(url);//retorna Base64
            //localStorage.setItem('my-img', url);


            //COLOCAR AQUI AS DIVS DA IMAGEM
            //const fileName = '<img src="../images/'+ file_n +'">'; 
            const fileName = '<img src="../images/' + file_n + '">';


            insertAtCursor(document.getElementById('questions'), fileName);//insere o filename(<img src="img_00001.png">) onde estiver o cursor

            guardaFoto(file_n, url);
        })

    };

    input.click();
}

function guardaFoto(file_n, url) {
    var img = [file_n, url]
    guardaFotos.push(img)
    //console.log(guardaFotos);

    //já salva a imagem no localStorage
    salvarLocalStorage()

}

// Função para inserir o texto no textarea onde o cursor está posicionado
function insertAtCursor(textarea, text) {
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;

    textarea.value = textarea.value.substring(0, startPos) + text + textarea.value.substring(endPos, textarea.value.length);

    // Reposicionar o cursor após a inserção do texto
    textarea.selectionStart = startPos + text.length;
    textarea.selectionEnd = startPos + text.length;
}








//FUNÇÃO PARA VERIFICAR E MOSTRAR AS QUESTÕES


function verificaquestoes() {
    //OCULTA O BOTÃO GERADOR
    document.getElementById('btn_gerador').style.display = "none";
    document.getElementById('title-form-group').style.display = "none";

    //LIMPA A DIV VERQUESTÕES
    if (document.getElementById('verquestoes')) {
        var elemento = document.getElementById("verquestoes");
        while (elemento.firstChild) {
            elemento.removeChild(elemento.firstChild);
        }
    }


    // Esconde a div de erros no início da verificação
    verErros.style.display = "none";
    verErros.innerHTML = ""; // Limpa os erros anteriores
    //console.log(document.getElementById("questions").value); //retorna toda string Html

    //var questions = document.getElementById("questions").value.split("\n\n");
    questions = document.getElementById("questions").value.replace(/^[ \t]+/gm, "").split("\n\n");
    console.log(questions);

    var verquestoes = document.getElementById("verquestoes");
    gerar = true;
    var contaalternativas = 0;

    //TRATANDO CADA QUESTÃO SOMENTE NO ARRAY "questions"
    for (var i = 0; i < questions.length; i++) {
        var question = questions[i].trim().split("\n");
        //console.log(question);

        var temresposta = false;
        var questaorepetida = false;
        var contarespostas = 0;
        contaalternativas = 0;
        //console.log("Questão:" +question.length);
        //['PERGUNTA', 'RESP1', '*RESP2', 'RESP3', 'RESP4', 'RESP5', 'FEEDBACK: resposta correta']

        //CONSULTA PARA EXCLUIR AS LINHAS VAZIAS

        if (question == "") {
            //console.log("vazio");
            questions.splice(i, 1); // Remove o item atual do array
            i--; // Ajusta o índice para não pular o próximo item
            continue;
        }
        //console.log("vai.. não está vazio");

        var div = document.createElement('div');
        div.id = 'container' + i;
        div.className = 'questao';

        //TÍTULO DA QUESTÃO - NÃO VAI PARA QTI
        div.innerHTML = "<strong>" + question[0] + "</strong>";

        //FISCALIZANDO A QUESTÃO
        for (var q = 1; q < question.length; q++) {
            //console.log(question[q]);
            var t = question[q].split(' ')[0].split('\t')[0].substring(0, 8); //t pega só os primeiros caracteres para remover espaços. 
            //console.log("t: " + t);//Retorna o texto abaixo: 

            //ENQUANTO EXISTIR ESPAÇO NO INICIO DE CADA LINHA DO ARRAY, RETIRA O ESPAÇO
            while (t == "" || t == " ") {
                question[q] = question[q].substring(1);
                t = question[q].split(' ')[0].substring(0, 8);
            }

            if (q == 2) {//Q = 2 É O INICIO DAS ALTERNATIVAS (SOMENTE LETRA A)
                //console.log("t: "+t);
                if (t != "A)" && t != "a)" && t != "*A)" && t != "*a)") {//SE AS ALTERNATIVAS NÃO COMEÇAREM COM "A)", JUNTAR AO ENUNCIADO
                    question[q - 1] += "<br/>" + question[q];
                    question.splice(q, 1);
                    q--;
                    continue;
                }
            }

            if (t == "FEEDBACK" || t == "Feedback" || t == "feedback") {
                //console.log("FEEDBACK")
                if (question[q + 1]) { //SE TIVER MAIS UM ELEMENTO NO ARRAY DEPOIS DO FEEDBACK
                    //FEEDBACK COM LINHA DE QUEBRA
                    question[q] += "<br/>" + question[q + 1];
                    question.splice(q + 1, 1);
                    q--;
                    continue;
                }

            } else {
                //VER SE TEM ALTERNATIVA CORRETA
                //console.log(question[q][0]) pega a primeira letra
                if (question[q][0] == "*") {
                    //console.log(question[q]);// *b) C, B, B, A, C, A
                    temresposta = true;
                    contarespostas++;
                }

                //VER SE TEM ESPAÇO DEPOIS DAS LETRAS DE CADA ALTERNATIVA, PARA NÃO IR PARA O ARRAY. 
                if (q > 1 && t[2]) {
                    if ((t[2] == ")" && t[3]) || t[2] != ")") {//NA ALTERNATIVA CORRETA VERIFICAR SE EXISTE A POSIÇÃO 3, SE NÃO NÃO HÁ ESPAÇO
                        console.log("falta espaço nessa alternativa: " + t);
                        div.style.backgroundColor = "#ffa1a1";
                        div.innerHTML += "<br/><span style='color:#cd0000'>ATENÇÃO: AS LETRAS DAS ALTERNATIVAS DEVEM CONTER ESPAÇO DEPOIS DO PARENTESES.</span>";
                        verErros.innerHTML += "ATENÇÃO: AS LETRAS DAS ALTERNATIVAS DEVEM CONTER ESPAÇO DEPOIS DO PARENTESES<br/>";
                        gerar = false;
                    }
                }

                //DELETAR AS PARTES VAZIAS DO ARRAY
                if (question[q] == "") {
                    question.splice(q, 1);
                    console.log("deletado espaço vazio");
                }

                if (q >= 2) {//VERIFICA SOMENTE AS ALTERNATIVAS. DEIXA DE FORA A DESCRIÇÃO DA PERGUNTA
                    //VER SE NÃO HÁ ALTERNATIVA REPETIDA
                    for (var qr = 2; qr < question.length - 1; qr++) {
                        //var alternativa = question[q].replace('*', '').replace(t+" ", "");
                        var alternativa = question[q].replace(question[q].substring(0, 3), "").replace('*', '').trim();
                        var alternativa2 = question[qr].replace(question[qr].substring(0, 3), "").replace('*', '').trim();
                        //console.log("alternativa["+(q-1)+"]: "+alternativa+ " | alternativa2["+(qr-1)+"]: "+alternativa2);
                        //console.log(alternativa == question[qr].replace('*', ''));

                        if (alternativa == alternativa2 && q != qr) {
                            questaorepetida = true;
                            //console.log("ALTERNATIVAS REPETIDAS!!!");
                            gerar = false;
                        }
                    }
                }

                //CONTA QUANTAS ALTERNATIVAS TEM NA QUESTÃO
                contaalternativas++
            }


            if (question.length < 3) {//SE TIVER ALGUMA QUESTÃO COM MENOS DE DUAS ALTERNATIVAS [0= NUMERO DA QUESTÃO, 1=TEXTO DA QUESTÃO, 2 EM DIANTE = ALTERNATIVAS E FEEDBACK]
                div.style.backgroundColor = "#ffa1a1";
                div.innerHTML += "<br/><span style='color:#cd0000'> ATENÇÃO: QUESTÃO SEM ALTERNATIVAS </span>";
                verErros.innerHTML += "ATENÇÃO: QUESTÃO SEM ALTERNATIVAS.<br/>";
                gerar = false;
            }

        }

        //AGORA FORMATANDO A QUESTÃO E VISUAZANDO
        for (var j = 1; j < question.length; j++) {

            //SEPARA AS PALAVRAS DA FRASE E PEGA AS 8 PRIMEIRAS LETRAS DA PRIMEIRA PALAVRA "FEEDBACK"
            var t = question[j].split(' ')[0].substring(0, 8);
            //console.log("t="+t);
            //console.log(question[j]);

            if (j == 1) {
                //PINTA O TEXTO DA PERGUNTA
                div.innerHTML += "<br/><span style='color:#005d0c'><p>" + find_Img(question[j]) + "</p></span>";
            } else if (t == "FEEDBACK" || t == "Feedback" || t == "feedback") { //VERIFICA SE TEM FEEDBACK
                //PINTA O FEEDBACK
                div.innerHTML += "<br/><br/><span style='color:#bb1100'>" + find_Img(question[j]) + "</span>";
                //console.log("t: "+t);
            } else {

                if (j > 2) div.innerHTML += "<br/>";

                //console.log(t);
                //TRATANDO RESPOSTA CORRETA
                if (question[j][0] == "*") {
                    let altern_sem_asterisco = question[j].replace(t + " ", "");// variavel temporária só pra deixar o visualização das alternativas sem o asterisco. Mas o array continua com a marcação.
                    question[j] = question[j].replace(t + " ", '*');//TIRA AS LETRAS DA ALTERNATIVA CORRETA NO ARRAY, MAS ADICIONA UM "" - O t TEM A PRIMEIRA PALAVRA
                    div.innerHTML += "<span style='color:#096522; font-size: 18px;'><strong>" + String.fromCharCode(j - 1 + 64) + ") " + find_Img(altern_sem_asterisco) + "</strong></span>";
                } else {
                    question[j] = question[j].replace(t + " ", "");//TIRA AS LETRAS DAS OUTRAS ALTERNATIVAS NO ARRAY - O t TEM A PRIMEIRA PALAVRA
                    div.innerHTML += "<strong>" + String.fromCharCode(j - 1 + 64) + ") </strong>" + find_Img(question[j]); //ACRESCENTA OS NÚMEROS NAS ALTERNATIVAS (SOMENTE NA VISUALIZAÇÃO, NO ARRAY NÃO)
                }


            }








            //ATUALIZA O ARRAY "questions"


            questions[i] = question;


            //console.log(questions);





        }





        //VERIFICA SE TEM RESPOSTA OU QUESTÃO REPETIDA OU MAIS DE UMA RESPOSTA


        if (temresposta == false || questaorepetida || contarespostas != 1 || contaalternativas <= 1) {


            gerar = false;


            div.style.backgroundColor = "#ffa1a1";


            //console.log("##############################");


            //console.log("######## Questão "+(i+1)+" #######");


            if (!temresposta) { verErros.innerHTML += "Falta a resposta correta.<br/>"; };


            if (questaorepetida) { verErros.innerHTML += "Tem alternativa repetida.<br/>"; };


            if (contarespostas > 1) { verErros.innerHTML += "Só pode ter 1 resposta correta.<br/>"; };


            if (contaalternativas <= 1) { verErros.innerHTML += "Precisa ter no mínimo 2 alternativa.<br/>"; };








        }





        //DIV PRONTA E PODE MOSTRAR NA PAGINA


        verquestoes.appendChild(div);





    }





    // Se houver erros, exibe a div de erros


    if (!gerar) {


        verErros.style.display = "block";


    } else {


        document.getElementById('btn_gerador').style.display = "block";


        document.getElementById('title-form-group').style.display = "block";


    }





    //console.log(questions);





}



//encontrar a imagem e troca para base64
function find_Img(t) {

    //console.log(t);

    if (typeof t === 'string' && t.includes('<img')) {
        const regex = /<img.*?src="(.*?)".*?\/?>/g; //AQUI É SÓ O METODO
        const matches = t.match(regex); //PEGA O METODO REGEX E LIMPA O TEXTO
        //console.log(matches); // retorna ['<img src="../images/img_00001.png">', '<img src="../images/img_00003.png">']
        if (matches) {
            matches.forEach(match => {
                const src = match.match(/src="(.*?)"/)[1]; //depois de achar a tag <img>, pega o nome da imagem
                //console.log(src); //retornou img_00001.png
                for (let i = 0; i < guardaFotos.length; i++) {
                    if (src.replace("../images/", "") == guardaFotos[i][0]) {
                        t = t.replace(src, guardaFotos[i][1]);
                        //console.log("Encontrou: " + src + " " + guardaFotos[i][0]); // Encontrou: img_00001.png img_00001.png
                    }
                }
            })
        }

    }

    return t;
}





//DESCRIÇÃO DA PERGUNTA EM UMA SÓ LINHA
function transformToSingleLine() {
    // Obtém a área de texto
    const textarea = document.getElementById("questions");

    // Obtém o texto selecionado (caso haja seleção)
    const selectedText = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd
    );

    // Verifica se há texto selecionado
    if (selectedText) {
        // Remove quebras de linha e espaços extras do texto selecionado
        const formattedText = selectedText.replace(/\n/g, "</p><p>").replace(/\s+/g, " ").trim();
        // Substitui o texto selecionado pelo texto em uma única linha

        textarea.value =
            textarea.value.substring(0, textarea.selectionStart) +
            "<p>"
            + formattedText +
            "</p>"
            + textarea.value.substring(textarea.selectionEnd);

    }


}


//COLOCAR AS LETRAS DAS ALTERNATIVAS
function colocaLetras() {
    // Obtém a área de texto
    const textarea = document.getElementById("questions");

    // Obtém o texto selecionado (caso haja seleção)
    const selectedText = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd
    );

    // Verifica se há texto selecionado
    if (selectedText) {
        // Separa o texto selecionado em linhas
        const lines = selectedText.split("\n");

        for (let i = 0; i < lines.length; i++) {
            // Remove tabulações e caracteres especiais das alternativas
            lines[i] = lines[i].replace(/\t/g, "").replace(/^[a-zA-Z][\)|\.|\-]\s*/i, "").trim();

            // Limpa os espaços do início de cada linha
            while (lines[i].charAt(0) === " ") {
                lines[i] = lines[i].substring(1);
            }

            // Preserva o asterisco, se presente, e remove qualquer letra alternativa existente
            let prefix = "";
            if (lines[i].charAt(0) === "*") {
                prefix = "*";
                lines[i] = lines[i].substring(1).replace(/^[a-zA-Z][\)|\.|\-]\s*/, "").trim();
            }

            // Adiciona a letra correspondente à alternativa
            lines[i] = prefix + String.fromCharCode(i + 65) + ") " + lines[i];
        }

        // Substitui o texto selecionado pelo texto formatado
        textarea.value = textarea.value.substring(0, textarea.selectionStart) +
            lines.join('\n') + textarea.value.substring(textarea.selectionEnd);
    }
}





//COLOCAR A PALAVRA FEEDBACK NO INICIO DAS PALAVRAS SELECIONADAS E DEIXA EM UMA SÓ LINHA
function PalavraFeedback() {
    // Obtém a área de texto
    const textarea = document.getElementById("questions");

    // Obtém o texto selecionado (caso haja seleção)
    let selectedText = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd
    );

    //limpa os espaços do inicio do feedback
    //console.log(selectedText[0]==" ");
    while (selectedText[0] == " ") {
        selectedText = selectedText.replace(selectedText[0], '').trim();
    }

    let t = selectedText.split(' ')[0].replace('\n', ' ');
    //console.log(t);
    //console.log(t.substring(0,8));
    if (t.substring(0, 8) == "FEEDBACK" || t.substring(0, 8) == "Feedback" || t.substring(0, 8) == "feedback") { //VERIFICA SE TEM FEEDBACK
        selectedText = selectedText.replace(t.split(' ')[0], "").trim();
        //console.log(selectedText);
    }

    // Verifica se há texto selecionado
    if (selectedText) {
        // Remove quebras de linha e espaços extras do texto selecionado
        const formattedText = selectedText.replace(/\n/g, "</p><p>").replace(/\s+/g, " ").trim();
        // Substitui o texto selecionado pelo texto em uma única linha
        textarea.value =
            textarea.value.substring(0, textarea.selectionStart) +
            "FEEDBACK: <p>"
            + formattedText +
            "</p>"
            + textarea.value.substring(textarea.selectionEnd);
    }


}


//COLOCAR AS PALAVRAS SELECIONADAS EM ITÁLICO
function Italico() {
    // Obtém a área de texto
    const textarea = document.getElementById("questions");

    // Obtém o texto selecionado (caso haja seleção)
    const selectedText = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd
    );

    // Verifica se há texto selecionado
    if (selectedText) {
        // Remove quebras de linha e espaços extras do texto selecionado
        const formattedText = selectedText;
        // Substitui o texto selecionado pelo texto em uma única linha
        textarea.value =
            textarea.value.substring(0, textarea.selectionStart) +
            "<i>"
            + formattedText +
            "</i>"
            + textarea.value.substring(textarea.selectionEnd);
    }


}

//COLOCAR AS PALAVRAS SELECIONADAS EM NEGRITO
function Negrito() {
    // Obtém a área de texto
    const textarea = document.getElementById("questions");

    // Obtém o texto selecionado (caso haja seleção)
    const selectedText = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd
    );



    // Verifica se há texto selecionado
    if (selectedText) {
        // Remove quebras de linha e espaços extras do texto selecionado
        const formattedText = selectedText;
        // Substitui o texto selecionado pelo texto em uma única linha
        textarea.value =
            textarea.value.substring(0, textarea.selectionStart) +
            "<strong>"
            + formattedText +
            "</strong>"
            + textarea.value.substring(textarea.selectionEnd);
    }


}


//SALVA NO LOCALSTORAGE O TÍTULO, QUESTÕES E IMAGENS.
var t;
function salvarLocalStorage() {

    clearTimeout(t);

    t = setTimeout(function () {
        //salva o item localStorage
        var title = document.getElementById("title").value;
        //var title_questao = document.getElementById("title_question").value;
        var textarea = document.getElementById("questions").value;


        localStorage.setItem("idCurso", title);
        //localStorage.setItem("idQuestao", title_questao);
        localStorage.setItem("idTextArea", textarea);

        //console.log(guardaFotos.length)
        localStorage.setItem("idImgFile", JSON.stringify(guardaFotos));


    }, 2000);

}


//CARREGA AS INFORMAÇÕES SALVA
CarregaStorage();
function CarregaStorage() {
    //Recuperar a informações do registro do localStorage
    var id_nome = localStorage.getItem("idCurso");
    if (id_nome) {
        document.getElementById("title").innerHTML = id_nome;
    } else {
        document.getElementById("title").innerHTML = "modelo_nomedocurso_ava_objetiva_onl";
    }


    var id_questoes = localStorage.getItem("idTextArea");
    if (id_questoes) {
        document.getElementById("questions").innerHTML = id_questoes;
    } else {
        document.getElementById("questions").innerHTML = "Questão 01:\nPERGUNTA\nA) RESP1\n*B) RESP2_CORRETA\nC) RESP3\nD) RESP4\nE) RESP5\nFEEDBACK: resposta 'RESP2' correta\n\nQuestão 02:\nPERGUNTA\nA) RESP1\nB) RESP2\nC) RESP3\n*D) RESP4_CORRETA\nE) RESP5\nFEEDBACK: resposta 'RESP4' correta";
    }


    var id_img = localStorage.getItem("idImgFile");

    if (id_img) {
        guardaFotos = JSON.parse(id_img);

    } else {
        guardaFotos = [];
    }




}


//REMOVE TODAS AS QUESTÕES E LIMPA O LOCALSTORAGE.
function limpaTudo() {

    localStorage.clear();

    const textarea = document.getElementById("questions");
    textarea.value = "Questão 01:\nPERGUNTA\nA) RESP1\n*B) RESP2_CORRETA\nC) RESP3\nD) RESP4\nE) RESP5\nFEEDBACK: OPCIONAL\n\nQuestão 02:\nPERGUNTA\nA) RESP1\nB) RESP2\nC) RESP3\n*D) RESP4_CORRETA\nE) RESP5\nFEEDBACK: OPCIONAL";

    document.getElementById("title").value = "modelo_nomedocurso_ava_objetiva_onl";

    guardaFotos = [];

    //LIMPA A DIV VERQUESTÕES
    if (document.getElementById('verquestoes')) {
        var elemento = document.getElementById("verquestoes");
        while (elemento.firstChild) {
            elemento.removeChild(elemento.firstChild);
        }
    }
}



//SE PRESSIONAR ALGUMA TECLA 
document.onkeyup = function (e) {
    //console.log(e.which);
    //CTRL+SHIFT+L = LIMPA TUDO
    if (e.ctrlKey && e.shiftKey && e.which == 76) {

        // Exibe uma caixa de diálogo de confirmação
        const userConfirmed = confirm("As questões serão apagadas! Posso continuar?");

        // Se o usuário clicar em "OK" (Sim), chama a função limpaTudo
        if (userConfirmed) {
            limpaTudo();
        }
    }

    //CTRL+SHIFT+SPACE = ADICIONA ESTRURA DA PERGUNTA
    if (e.ctrlKey && e.shiftKey && e.which == 32) {
        addQuestion();
    }

};


function addQuestion() {
    //const textarea = document.getElementById("questions");
    const textEstr = "Questão 0000\nPERGUNTA\nA) \nB) \nC) \nD) \nE) \nFEEDBACK: ";

    insertAtCursor(document.getElementById('questions'), textEstr);
}