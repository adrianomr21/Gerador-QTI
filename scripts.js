document.addEventListener('DOMContentLoaded', () => {
    const themeSwitcher = document.getElementById('theme-switcher');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(`${currentTheme}-theme`);
    themeSwitcher.textContent = currentTheme === 'light' ? 'Modo Escuro' : 'Modo Claro';

    const modal = document.getElementById('instructions-modal');
    const openModalBtn = document.getElementById('open-instructions-modal');
    const closeModalBtn = document.querySelector('.close-button');

    openModalBtn.onclick = function() {
        modal.style.display = "block";
    }

    closeModalBtn.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    themeSwitcher.addEventListener('click', () => {
        let theme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
        themeSwitcher.textContent = theme === 'light' ? 'Modo Escuro' : 'Modo Claro';
        localStorage.setItem('theme', theme);
    });

    // All other functions from the original file go here
    var guardaFotos =[];
    var gerar=true;
    var verErros = document.getElementById("verErros");
    var questions;

    window.generateQti = function() {
        var zip = new JSZip();
        var pasta_images = zip.folder("images");
        var qtiFolder = zip.folder("qti21");
        zip.folder("csfiles").folder("home_dir");
      
        var title = document.getElementById("title").value;
        gerar=true;

        var assessmentItemRefs = '';
        let nameimagens = [];
        
        for (var i = 0; i < questions.length; i++) {
            let question = questions[i];
            let imagens = [];

            for (let j = 0; j < question.length; j++) {
                if (typeof question[j] === 'string' && question[j].includes('<img')) {
                    const regex = /<img.*?src="(.*?)".*?\/?>/g;
                    const matches = question[j].match(regex);
                    if(matches){
                        matches.forEach(match => {
                            let nomeImagem = match.match(/src="(.*?)"/)[1];
                            nomeImagem = nomeImagem.replace("../images/","");
                            for(let k=0; k<guardaFotos.length; k++){
                                if(nomeImagem == guardaFotos[k][0]){
                                    imagens.push(nomeImagem);
                                }
                            }
                        })
                    }  
                }
            }
            nameimagens.push(imagens);
                            
            for(var b=0; b< nameimagens.length; b++){
                for(var c=0; c<nameimagens[b].length; c++){
                    var encontrouImg = false;
                    for(var a=0; a< guardaFotos.length; a++){
                        if(nameimagens[b][c] == guardaFotos[a][0]){
                            pasta_images.file(guardaFotos[a][0], guardaFotos[a][1].split(",")[1] , { base64: true } );
                            encontrouImg = true;
                        }
                    }

                    if(!encontrouImg){
                        verErros.innerHTML += `Questão ${b+1}: Não encontrou a imagem, recolocar pelo botão (IMAGEM)<br/>`;
                        gerar = false;
                        var divQ = document.getElementById('container'+b);
                        if(divQ){
                            divQ.style.backgroundColor  = "#ffa1a1";
                        }
                    }
                }
            }

            var feedback = "";
            var responses;
            var t = question[question.length-1].split(' ')[0].substring(0,8);

            if(t.toUpperCase() == "FEEDBACK"){
                feedback = question[question.length-1] ? question[question.length-1].replace(/FEEDBACK: /gi, "").replace(/FEEDBACK. /gi, "").replace(/FEEDBACK /gi, "") : "";
                responses = question.slice(2, question.length-1);
            }else{
                responses = question.slice(2, question.length);
            }

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
        <choiceInteraction responseIdentifier="RESPONSE" maxChoices="1" shuffle="false">`;
            
            var n_alt = feedback=="" ? question.length : question.length-1;
            
            for (var j = 2; j < n_alt; j++) {
                var choice = question[j].replace('*', '');
                xmlString += `<simpleChoice identifier="answer_${j-1}" fixed="true">
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
            
            qtiFolder.file(assessmentItemFileName, xmlString);
            assessmentItemRefs += `<assessmentItemRef identifier="${identifier}" href="${assessmentItemFileName}" />\n`;
        }

        var questionBankXml = `<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd" identifier="question_bank00001" title="${title}">
    <testPart identifier="question_bank00001_1" navigationMode="nonlinear" submissionMode="simultaneous">
        <assessmentSection identifier="question_bank00001_1_1" visible="false" title="Section 1">
            ${assessmentItemRefs}
        </assessmentSection>
    </testPart>
</assessmentTest>`;
        qtiFolder.file("question_bank00001.xml", questionBankXml);
        
        var imsManifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="man00001" xmlns="http://www.imsglobal.org/xsd/imscp_v1p1" xmlns:csm="http://www.imsglobal.org/xsd/imsccv1p2/imscsmd_v1p0" xmlns:imsmd="http://ltsc.ieee.org/xsd/LOM" xmlns:imsqti="http://www.imsglobal.org/xsd/imsqti_metadata_v2p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 http://www.imsglobal.org/xsd/imscp_v1p2.xsd http://ltsc.ieee.org/xsd/LOM imsmd_loose_v1p3.xsd http://www.imsglobal.org/xsd/imsqti_metadata_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_metadata_v2p1.xsd http://www.imsglobal.org/xsd/imsccv1p2/imscsmd_v1p0 http://www.imsglobal.org/profile/cc/ccv1p2/ccv1p2_imscsmd_v1p0.xsd">
<metadata><schema>QTIv2.1</schema><schemaversion>2.0</schemaversion></metadata>
<organizations/>
    <resources>`;
        for (var i = 0; i < nameimagens.length; i++) {
            for (var j = 0; j < nameimagens[i].length; j++) {
                var img_name = nameimagens[i][j];
                imsManifestXml +=`<resource href="images/${img_name}" identifier="ccres0000${i}_${j}" type="webcontent">  <file href="images/${img_name}"/></resource>`
            }
        }
        imsManifestXml +=`<resource href="qti21/question_bank00001.xml" identifier="question_bank00001" type="imsqti_test_xmlv2p1">
            <file href="qti21/question_bank00001.xml"/>
            ${questions.map((_, i) => `<dependency identifierref="assessmentItem${String(i + 1).padStart(5, '0')}"/>`).join("\n")}
        </resource>`;
        for (var i = 0; i < questions.length; i++) {
            imsManifestXml +=`<resource href="qti21/assessmentItem${String(i + 1).padStart(5, '0')}.xml" identifier="assessmentItem${String(i + 1).padStart(5, '0')}" type="imsqti_item_xmlv2p1">
                <file href="qti21/assessmentItem${String(i + 1).padStart(5, '0')}.xml"/>`;
            
            for (let i = 0; i < nameimagens.length; i++) {
                for (let j = 0; j < nameimagens[i].length; j++) {
                    imsManifestXml += `<dependency   identifierref="ccres0000${i}_${j}"/>`;
                }
            }
            imsManifestXml +=`</resource>`;
        }
        imsManifestXml +=`</resources> 
</manifest>`;

        zip.file("imsmanifest.xml", imsManifestXml);

        if(gerar){
            zip.generateAsync({ type: 'blob' })
            .then(function(content) {
                saveAs(content, title+".zip");
            });
        }
    }

    window.selecionarImagem = function() {
        const input = document.createElement('input');
        input.type = 'file';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            const file_n = `img_${String(guardaFotos.length+1).padStart(5,'0')}.png`;

            const fr = new FileReader();
            fr.readAsDataURL(file);
            fr.addEventListener('load',()=>{
                const url = fr.result;
                const fileName = '<img src="../images/'+ file_n +'">'; 
                insertAtCursor(document.getElementById('questions'), fileName);
                guardaFoto(file_n, url);
            })
        };
        input.click();
    }
    
    function guardaFoto(file_n, url){
        var img = [file_n, url];
        guardaFotos.push(img);
        salvarLocalStorage();
    }

    function insertAtCursor(textarea, text) {
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, startPos) + text + textarea.value.substring(endPos, textarea.value.length);
        textarea.selectionStart = startPos + text.length;
        textarea.selectionEnd = startPos + text.length;
    }

    document.getElementById('btn_gerador').style.display = "none";

    window.verificaquestoes = function() {
        document.getElementById('btn_gerador').style.display = "none";
        
        if(document.getElementById('verquestoes')){
            var elemento = document.getElementById("verquestoes");
            while (elemento.firstChild) {
                elemento.removeChild(elemento.firstChild);
            }
        }

        questions = document.getElementById("questions").value.replace(/\n\s/g, "\n\n").replace(/\n\t/g, "\n\n").split("\n\n");
        
        var verquestoes = document.getElementById("verquestoes");
        gerar=true;
        var contaalternativas = 0;
        verErros.innerHTML ="";
        verErros.style.display = "none";

                var errorQuestions = [];

        

                for (var i = 0; i < questions.length; i++) {

                    var question = questions[i].trim().split("\n");

                    var temresposta = false;

                    var questaorepetida = false;

                    var contarespostas = 0;

                    contaalternativas = 0;

                    var hasError = false;

        

                    if(question == ""){

                        questions.splice(i, 1);

                        i--;

                        continue;

                    }

        

                    var div = document.createElement('div');

                    div.id = 'container'+i;

                    div.className = 'questao';

                    div.innerHTML = "<strong>"+question[0]+"</strong>";

        

                    var errorDiv = document.createElement('div');

                    errorDiv.className = 'error-container';

                    errorDiv.style.display = 'none';

                                    for(var q=1; q < question.length; q++){
                    
                                        var t = question[q].split(' ')[0].split('  ')[0].substring(0,8);
                    
                                        while(t == "" || t == " "){
                    
                                            question[q] = question[q].substring(1);
                    
                                            t = question[q].split(' ')[0].substring(0,8);
                    
                                        }
                    
                        
                    
                                        if(q==2){
                    
                                            if(t.toUpperCase() != "A)" && t.toUpperCase() != "*A)"){
                    
                                                div.style.backgroundColor  = "#ffa1a1";
                    
                                                errorDiv.innerHTML += "<span style='color:#cd0000'>ATENÇÃO: CORRIGIR ESTRUTURA DA PERGUNTA.</span><br/>";
                    
                                                hasError = true;
                    
                                                gerar = false;
                    
                                            }
                    
                                        }
                    
                                        
                    
                                        if(t.toUpperCase() == "FEEDBACK"){
                    
                                            if(question[q+1]){
                    
                                                div.style.backgroundColor  = "#ffa1a1";
                    
                                                errorDiv.innerHTML += "<span style='color:#cd0000'>ATENÇÃO: FEEDBACK COM QUEBRA DE LINHA.</span><br/>";
                    
                                                hasError = true;
                    
                                                gerar = false;
                    
                                            }
                    
                                        }else{
                    
                                            if(question[q][0]=="*"){
                    
                                                temresposta=true;
                    
                                                contarespostas++;
                    
                                            }
                    
                        
                    
                                            if(q>1 && t[2]){
                    
                                                if((t[2] == ")" && t[3]) || t[2] != ")"){
                    
                                                    div.style.backgroundColor  = "#ffa1a1";
                    
                                                    errorDiv.innerHTML += "<span style='color:#cd0000'>ATENÇÃO: AS LETRAS DAS ALTERNATIVAS DEVEM CONTER ESPAÇO DEPOIS DO PARENTESES.</span><br/>";
                    
                                                    hasError = true;
                    
                                                    gerar = false;
                    
                                                }
                    
                                            }
                    
                        
                    
                                            if(question[q]==""){
                    
                                                question.splice(q,1);
                    
                                            }
                    
                        
                    
                                            if(q>=2){
                    
                                                for(var qr=2; qr < question.length-1; qr++){
                    
                                                    var alternativa = question[q].replace(question[q].substring(0,3),"").replace('*', '').trim();
                    
                                                    var alternativa2 = question[qr].replace(question[qr].substring(0,3),"").replace('*', '').trim();
                    
                                                    if(alternativa == alternativa2 && q != qr){
                    
                                                        questaorepetida = true;
                    
                                                        gerar = false;
                    
                                                    }
                    
                                                }
                    
                                            }
                    
                                            contaalternativas++
                    
                                        }
                    
                        
                    
                                        if(question.length<3){
                    
                                            div.style.backgroundColor  = "#ffa1a1";
                    
                                            errorDiv.innerHTML +="<span style='color:#cd0000'> ATENÇÃO: QUESTÃO SEM ALTERNATIVAS </span><br/>";
                    
                                            hasError = true;
                    
                                            gerar = false;
                    
                                        }
                    
                                    }
                    
                        
                    
                                    for(var j=1; j < question.length; j++){
                    
                                        var t = question[j].split(' ')[0].substring(0,8);
                    
                                        if(j==1){
                    
                                            div.innerHTML +=  "<br/><span style='color:#005d0c'><p>"+find_Img(question[j])+"</p></span>"; 
                    
                                        }else if(t.toUpperCase() == "FEEDBACK"){
                    
                                            div.innerHTML +=  "<br/><br/><span style='color:#bb1100'>"+find_Img(question[j])+"</span>";
                    
                                        }else{
                    
                                            if(j>2)div.innerHTML +="<br/>";
                    
                                            if(question[j][0]=="*"){
                    
                                                let altern_sem_asterisco = question[j].replace(t+" ", '');
                    
                                                question[j] = question[j].replace(t+" ", '*');
                    
                                                div.innerHTML += "<span style='color:#096522; font-size: 18px;'><strong>"+String.fromCharCode(j-1 + 64) +") "+find_Img(altern_sem_asterisco)+"</strong></span>";
                    
                                            }else{
                    
                                                question[j] = question[j].replace(t+" ", '');
                    
                                                div.innerHTML += "<strong>"+String.fromCharCode(j-1 + 64) +") </strong>"+find_Img(question[j]);
                    
                                            }
                    
                                        }
                    
                                        questions[i] = question;
                    
                                    }
                    
                        
                    
                                    if(temresposta == false || questaorepetida || contarespostas!=1 || contaalternativas<=1){
                    
                                        gerar = false;
                    
                                        div.style.backgroundColor  = "#ffa1a1";
                    
                                        if(!temresposta){errorDiv.innerHTML +="Falta a resposta correta.<br/>"; hasError = true;};
                    
                                        if(questaorepetida){errorDiv.innerHTML +="Tem alternativa repetida.<br/>"; hasError = true;};
                    
                                        if(contarespostas > 1){errorDiv.innerHTML +="Só pode ter 1 resposta correta.<br/>"; hasError = true;};
                    
                                        if(contaalternativas<=1){errorDiv.innerHTML +="Precisa ter no mínimo 2 alternativa.<br/>"; hasError = true;};
                    
                                    }
                    
                        
                    
                                    verquestoes.appendChild(div);
                    
                                    
                    
                                    if(hasError) {
                    
                                        errorDiv.style.display = 'block';
                    
                                        verquestoes.appendChild(errorDiv);
                    
                                        errorQuestions.push(String(i + 1).padStart(2, '0'));
                    
                                    }
                    
                        
                    
                                    if(gerar){
                    
                                        document.getElementById('btn_gerador').style.display = "block";
                    
                                    }
                }

        

                if (errorQuestions.length > 0) {

                    verErros.innerHTML = `Questões com problemas: ${errorQuestions.join(', ')}`;

                    verErros.style.display = "block";

                } else {

                    verErros.style.display = "none";

                }
    }

    function find_Img(t){
        if (typeof t === 'string' && t.includes('<img')) {
            const regex = /<img.*?src="(.*?)".*?\/?>/g;
            const matches = t.match(regex);
            if(matches){
                matches.forEach(match => {
                    const src = match.match(/src="(.*?)"/)[1];
                    for(let i=0; i<guardaFotos.length; i++){
                        if(src.replace("../images/","") == guardaFotos[i][0]){
                            t = t.replace(src, guardaFotos[i][1]);
                        }
                    }
                })
            }
        }
        return t;
    }

    document.getElementById("convertToHtml").addEventListener("click", function () {
        transformToSingleLine();
    });

    function transformToSingleLine() {
        const textarea = document.getElementById("questions");
        const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        if (selectedText) {
            const formattedText = selectedText.replace(/\n/g, "</p><p>").replace(/\s+/g, " ").trim();
            textarea.value = textarea.value.substring(0, textarea.selectionStart) + "<p>"+ formattedText + "</p>"+ textarea.value.substring(textarea.selectionEnd);
        }
    }

    window.colocaLetras = function() {
        const textarea = document.getElementById("questions");
        const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        if (selectedText) {
            const lines = selectedText.split("\n");
            for (let i = 0; i < lines.length; i++) {
                lines[i] = lines[i].replace(/\t/g, "").replace(/^[a-zA-Z][\)|\.|\-]\s*/i, "").trim();
                while (lines[i].charAt(0) === " ") {
                    lines[i] = lines[i].substring(1);
                }
                let prefix = "";
                if (lines[i].charAt(0) === "*") {
                    prefix = "*";
                    lines[i] = lines[i].substring(1).replace(/^[a-zA-Z][\)|\.|\-]\s*/, "").trim();
                }
                lines[i] = prefix + String.fromCharCode(i + 65) + ") " + lines[i];
            }
            textarea.value = textarea.value.substring(0, textarea.selectionStart) + lines.join('\n') + textarea.value.substring(textarea.selectionEnd);
        }
    }

    window.PalavraFeedback = function() {
        const textarea = document.getElementById("questions");
        let selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        while(selectedText[0]==" "){
            selectedText = selectedText.replace(selectedText[0], '').trim();
        }
        let t = selectedText.split(' ')[0].replace('\n', ' ');
        if(t.substring(0,8).toUpperCase() == "FEEDBACK"){ 
            selectedText = selectedText.replace(t.split(' ')[0], "").trim();
        }
        if (selectedText) {
            const formattedText = selectedText.replace(/\n/g, "</p><p>").replace(/\s+/g, " ").trim();
            textarea.value = textarea.value.substring(0, textarea.selectionStart) + "FEEDBACK: <p>"+ formattedText + "</p>"+ textarea.value.substring(textarea.selectionEnd);
        }
    }

    window.Italico = function() {
        const textarea = document.getElementById("questions");
        const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        if (selectedText) {
            const formattedText = selectedText;
            textarea.value = textarea.value.substring(0, textarea.selectionStart) + "<i>"+ formattedText + "</i>"+ textarea.value.substring(textarea.selectionEnd);
        }
    }

    window.Negrito = function() {
        const textarea = document.getElementById("questions");
        const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        if (selectedText) {
            const formattedText = selectedText;
            textarea.value = textarea.value.substring(0, textarea.selectionStart) + "<strong>"+ formattedText + "</strong>"+ textarea.value.substring(textarea.selectionEnd);
        }
    }

    var t;
    window.salvarLocalStorage = function(){
        clearTimeout(t);
        t = setTimeout(function() {
            var title = document.getElementById("title").value;
            var textarea = document.getElementById("questions").value;
            localStorage.setItem("idCurso", title);
            localStorage.setItem("idTextArea", textarea);
            localStorage.setItem("idImgFile", JSON.stringify(guardaFotos));
        }, 2000);
    }

    function CarregaStorage(){
        var id_nome = localStorage.getItem("idCurso");
        if(id_nome){
            document.getElementById("title").innerHTML = id_nome;  
        }else{
            document.getElementById("title").innerHTML = "modelo_nomedocurso_ava_objetiva_onl";
        }

        var id_questoes = localStorage.getItem("idTextArea");
        if(id_questoes){
            document.getElementById("questions").innerHTML = id_questoes;
        }else{
            document.getElementById("questions").innerHTML = "Questão 01:\nPERGUNTA\nA) RESP1\n*B) RESP2_CORRETA\nC) RESP3\nD) RESP4\nE) RESP5\nFEEDBACK: OPCIONAL\n\nQuestão 02:\nPERGUNTA\nA) RESP1\nB) RESP2\nC) RESP3\n*D) RESP4_CORRETA\nE) RESP5\nFEEDBACK: OPCIONAL";
        }

        var id_img = localStorage.getItem("idImgFile");
        if(id_img){
            guardaFotos = JSON.parse(id_img);
        }else{
            guardaFotos=[];
        }
    }
    CarregaStorage();

    function limpaTudo(){
        localStorage.clear();
        const textarea = document.getElementById("questions");
        textarea.value = "Questão 01:\nPERGUNTA\nA) RESP1\n*B) RESP2_CORRETA\nC) RESP3\nD) RESP4\nE) RESP5\nFEEDBACK: OPCIONAL\n\nQuestão 02:\nPERGUNTA\nA) RESP1\nB) RESP2\nC) RESP3\n*D) RESP4_CORRETA\nE) RESP5\nFEEDBACK: OPCIONAL";
        document.getElementById("title").value = "modelo_nomedocurso_ava_objetiva_onl";
        guardaFotos = [];
        if(document.getElementById('verquestoes')){
            var elemento = document.getElementById("verquestoes");
            while (elemento.firstChild) {
                elemento.removeChild(elemento.firstChild);
            }
        }
    }

    document.onkeyup = function(e) {
        if (e.ctrlKey && e.shiftKey && e.which == 76) {
            const userConfirmed = confirm("As questões serão apagadas! Posso continuar?");
            if (userConfirmed) {
                limpaTudo();
            }
        }
        if (e.ctrlKey && e.shiftKey && e.which == 32) {
            addQuestion();
        }
    };

    function addQuestion(){
        const textEstr = "Questão 0000\nPERGUNTA\nA) \nB) \nC) \nD) \nE) \nFEEDBACK: ";
        insertAtCursor(document.getElementById('questions'), textEstr);
    }
});
