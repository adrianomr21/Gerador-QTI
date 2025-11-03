document.getElementById('fileInput').addEventListener('change', function (event) {
    // Cria uma instância da classe FileList para acessar os arquivos selecionados
    var files = event.target.files;
            
    // Verifica se um arquivo foi selecionado
    if (files.length > 0) {
        // Instancia um novo objeto JSZip
        var zip = new JSZip();

        // Lê o arquivo ZIP selecionado
        zip.loadAsync(files[0])
            .then(function (zipFile) {
                //console.log(zipFile);

                //TRATANDO AS PERGUNTAS-------------------------------------
                // Itera sobre os arquivos .xml na pasta qti21
                zipFile.folder('qti21').forEach(function (relativePath, zipEntry) {

                    //ESCREVE ENUNCIADO NO TEXTAREA-----------
                    document.getElementById('questions').value ="";

                    //console.log(zipEntry.async('string'));
                    //console.log(relativePath);

                    // Verifica se o arquivo é um arquivo assessmentItem00001.xml
                    if (zipEntry.name.endsWith('.xml')) {
                        // Lê o conteúdo do arquivo
                        zipEntry.async('string')
                            .then(xmlString => {

                                //console.log(xmlString);//xmlString traz todo o texto completo
                                
                                // TAG COM A PERGUNTA E ALTERNATIVAS.... 
                                //Chama a Função que executa a expressão regular no texto XML para encontrar o conteúdo da tag <itemBody>
                                var itemBodyContent = FuncRegex(/<itemBody>([\s\S]*?)<\/itemBody>/, xmlString);
                                //console.log(itemBodyContent);

                                //Encontrar todas as imagens e ajustar o caminho. ../images/imagem00001.png
                                itemBodyContent = encontraImg(itemBodyContent);
                                
                                
                                if(itemBodyContent){//CONDIÇÃO PARA CONTINUAR SÓ SE ENCONTRAR AS PERGUNTAS
                                    
                                    //TÍTULO DA QUESTÃO-------
                                    //var titulo = 'QUESTÃO: ' + zipEntry.name.replace(/^qti21\/(.*?)\.xml$/, '$1') + '\n';
                                    var titulo = 'QUESTÃO: ' + relativePath.replace(/^(.*?)\.xml$/, '$1').slice(-5);
                                    document.getElementById('questions').value += '\n'+titulo+'\n';

                                    //SEPARA ENUNCIADO--------
                                    //chama a função para separar a descrição da pergunta das alternativas que estão dentro da tag <itemBody>
                                    let enunciado_pergunta = FuncRegex(/([\s\S]*?)<choiceInteraction/, itemBodyContent);
                                    //limpa a descrição da pergunta tirando os espaços e as tags <div>
                                    enunciado_pergunta = enunciado_pergunta.replace(/<div>/g, "").replace(/<\/div>/g, "").replace(/\n/g, " ").replace(/\s+/g, " ").trim();
                                    //console.log("Enunciado: [Questão: "+titulo+"] "+enunciado_pergunta);

                                    //ESCREVE ENUNCIADO NO TEXTAREA-----------
                                    document.getElementById('questions').value += enunciado_pergunta + '\n';
                                    
                                    
                                    //RESPOSTA CORRETA--------------
                                    let reposta_correta = FuncRegex(/<correctResponse>[\s\S]*<value>([\s\S]*?)<\/value>[\s\S]*<\/correctResponse>/, xmlString);

                                    //ALTERNATIVAS----------
                                    let regex = /<simpleChoice[^>]*identifier="([^"]*)"[^>]*>([\s\S]*?)<\/simpleChoice>/g;
                                    let match;
                                    let index = 0;
                                    while ((match = regex.exec(itemBodyContent)) !== null) {
                                        let identifier = match[1];
                                        let alternativa = match[2].replace(/\n/g, " ").replace(/\s+/g, " ").trim();

                                        if(identifier === reposta_correta){
                                            //ESCREVE NO TEXTAREA
                                            document.getElementById('questions').value += "*"+String.fromCharCode(index + 65)+') ' + alternativa + '\n';
                                        }else{
                                            //ESCREVE NO TEXTAREA
                                            document.getElementById('questions').value += String.fromCharCode(index + 65)+') ' + alternativa + '\n';
                                        }
                                        index++;
                                    }
                                    

                                    //FEEDBACK--------------
                                    let regexFeed = /<modalFeedback[^>]*>([\s\S]*?)<\/modalFeedback>/g;
                                    let matchFeed;
                                    while ((matchFeed = regexFeed.exec(xmlString)) !== null) {
                                        let feedback = matchFeed[1].replace(/<div>/g, "").replace(/<\/div>/g, "").replace(/\n/g, " ").replace(/\s+/g, " ").trim();
                                        if(matchFeed[0].includes('identifier="correct_fb"')){

                                            //ESCREVE NO TEXTAREA
                                            document.getElementById('questions').value += "FEEDBACK: " + feedback + "\n";

                                        }
                                    }
                                    
                                }

                            });
                    }
                });

                //TRATANDO AS IMAGENS---------------------------------------
                //zipFile.folder('images').forEach(function (relativePath, zipEntry) {
                zipFile.forEach(function (relativePath, zipEntry) {
                    //if (!zipEntry.dir) { // Verifica se é um arquivo, não um diretório
                    if (!zipEntry.dir && !relativePath.endsWith('.xml') && (relativePath.startsWith('images/') || !relativePath.includes('/'))) {
                        zipEntry.async('blob').then(function (blob) {
                            // Carrega o blob como URL de dados
                            var reader = new FileReader();
                            reader.readAsDataURL(blob);
                            reader.onloadend = function () {
                                // Obtém o conteúdo da imagem como base64
                                let base64Data = reader.result;
                                // Faça o que quiser com a base64Data aqui, como enviá-la para o servidor ou exibi-la na página
                                //console.log('Base64 da imagem ' + relativePath + ': ' + base64Data);
                                //imagensBase64.push([relativePath, base64Data]);
                                guardaFotos.push([relativePath.replace("images/", ""), base64Data]);
                                //console.log('Imagens:\n', imagensBase64);//['Imagem13.jpg', 'data:appli...']
                                
                            };
                        });
                    }
                });
            });
    }
});


//Executa a expressão regular no texto, para extrair só o necessário.
function FuncRegex(regex, texto){
    var match =  texto.match(regex); 
    return match ? match[1] : 0;
}


//QUANDO O ZIP TEM IMAGENS NA RAIZ, ESSA FUNÇÃO ARRUMA O CAMINHO DA IMAGEM
function encontraImg(t){
    if (typeof t === 'string' && t.includes('<img')) {
        const regex = /<img.*?src="(.*?)".*?\/?>/g; //AQUI É SÓ O METODO
        const matches = t.match(regex); //PEGA O METODO REGEX E LIMPA O TEXTO
        //console.log(matches); // retorna ['<img src="../images/img_00001.png">', '<img src="../images/img_00003.png">']
        if(matches){
            matches.forEach(match => {
                const src = match.match(/src=\"(.*?)\"/)[1]; //depois de achar a tag <img>, pega o nome da imagem
                //console.log(src);
                if(!src.includes("../images/")){
                    let tmp = src.replace("..", "");
                    t = t.replace(src, "../images"+tmp);
                }
            
            });
        }
    }
    return t;
}