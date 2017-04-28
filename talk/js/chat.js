var ws = null;
var urlRest = 'http://localhost:8080/talkserver/rest/';
var usuarioLogado;
var loginContatoSelecionado;

function init(){
	usuarioLogado = sessionStorage.getItem("login");	
	connect();
	setRefreshingContatosAceitos();	
}

function connect() {
    var webSocketServer = 'ws://localhost:8080/talkserver/chat';
    if (webSocketServer == '') {
        alert('Não foi possível conectar ao servidor.');
        return;
    }
    if ('WebSocket' in window) {
        ws = new WebSocket(webSocketServer);
    } 

    ws.onopen = function () {        
        addConv('Você está conectado...');
    };
    ws.onmessage = function (event) {            	
        addConversaRecebida('Recebido: ' + event.data);
    };
    ws.onclose = function (event) {                
        addConv('Aviso: Houve um problema e a conexão foi encerrada.');
    };
}

function closeSession(){
	ws.close();
}

function enviarMsg() {
	var mensagem = $('#campoMsg').val();
    if(!mensagem){
    	return false;
    }    
	if(!loginContatoSelecionado){
		alert('Selecione um contato para iniciar uma conversa.');
		return false;
	}

    if (ws != null) {        
        addConversaEnvio('Enviado: ' + mensagem + "@" + formatDate(new Date()));
        ws.send(JSON.stringify({
			  origem: usuarioLogado,
			  destino: loginContatoSelecionado,
			  mensagem: mensagem,
			  data: formatDate(new Date())
			})        	
       	);


        $('#campoMsg').val('');

    } else {
        alert('A conexão não está ativa.');
    }
}

function addConversaEnvio(texto){
	var msgData = texto.split('@');

	if(msgData){
		var usuarioOrigemMensagem = msgData[2];		
		var div = '<div style="height: 50px; width: 55%;margin-left: 200px; color: #2F4F4F;"><div style="font-size: 16px;">'+msgData[0]+'</div><div style="font-size: 11px;">'+msgData[1]+'</div></div>'
		$('#historicoConversa').append(div);	
		$('#historicoConversa').scrollTop($('#historicoConversa').height());						
	}
}

function addConversaHistorico(texto){
	var msgData = texto.split('@');
	var usuarioOrigemMensagem = msgData[2];

	if(msgData){
		var div;		
		if(usuarioOrigemMensagem == usuarioLogado){
			div = '<div style="height: 50px; width: 55%;margin-left: 200px; color: #2F4F4F;"><div style="font-size: 16px;">'+'Enviado: '+msgData[0]+'</div><div style="font-size: 11px;">'+msgData[1]+'</div></div>'
		}
		else{
			div = '<div style="height: 50px; width: 55%; color: #B22222;"><div style="font-size: 16px;">'+'Recebido: '+msgData[0]+'</div><div style="font-size: 11px;">'+msgData[1]+'</div></div>'	
		}		
		
		$('#historicoConversa').append(div);	
		$('#historicoConversa').scrollTop($('#historicoConversa').height());		
			
	}	
}


function addConversaRecebida(texto){
	var msgData = texto.split('@');
	console.log(msgData);
	if(msgData){
		var usuarioOrigemMensagem = msgData[2];
		console.log('msg recebida ' + usuarioOrigemMensagem);
		if(usuarioOrigemMensagem == loginContatoSelecionado){
			var div = '<div style="height: 50px; width: 55%; color: #B22222;"><div style="font-size: 16px;">'+msgData[0]+'</div><div style="font-size: 11px;">'+msgData[1]+'</div></div>'
			$('#historicoConversa').append(div);	
			$('#historicoConversa').scrollTop($('#historicoConversa').height());		
		}
		else{
			$.notify(usuarioOrigemMensagem + " enviou uma mensagem...", "info");
		}		
	}	
}

function addConv(texto){			
	var div = '<div style="height: 50px; width: 55%"><div style="font-size: 16px;">'+texto+'</div></div>'
	$('#historicoConversa').append(div);	
	$('#historicoConversa').scrollTop($('#historicoConversa').height());					
}

function adicionarContato(contatoSelecionado){
	console.log('contatoSelecionado ' + contatoSelecionado);	
	$.ajax({
		type : "POST",			
		url : urlRest + 'chatService/adicionarContato/'+usuarioLogado+'/'+contatoSelecionado,
		success : function(dados) {
			console.log('contato adicionado');
		}, //END success
		error : function(e) {				
			alert('Erro: Não foi possível obter os dados do Web Service.');
			
		} // END error
	}).done(function () {
    	setRefreshingContatosAceitos();    
    }); ; // END $.ajax		
}


function setRefreshingContatosAceitos(){
	console.log('refreshing contatos aceitos...');

	$('#divContatosAdicionados').remove();
	$('#divContatos').append('<div id="divContatosAdicionados"></div>');	

	console.log('userLogado '+usuarioLogado);
	$.ajax({
		type : "GET",			
		url : urlRest + 'chatService/getContatosAceitos/'+usuarioLogado,
		success : function(dados) {
			for (var i = 0; i < dados.length; i++) {
				var contato = dados[i].usuario.apelido;				
				var contatoSelecionado = dados[i].usuario.login;				

				var div = '<div style="width: 90%;"><a class="bloco-link color" style="text-decoration:none" onclick="alterarTituloConversa(\''+contato+'\');selectContato(\''+contatoSelecionado+'\');" href="#">'+contato+'</a></div>';
				$('#divContatosAdicionados').append(div);
			}			

		}, //END success
		error : function(e) {				
			alert('Erro: Não foi possível obter os dados do Web Service. @setRefreshingContatosAceitos@');
			
		} // END error
	})// END $.ajax
}


function alterarTituloConversa(nomeContato){
	$("#lbNomeContatoSelecionado").remove();	
	$("#divNomeContatoSelecionado").append('<h5 id="lbNomeContatoSelecionado">Conversando com: '+nomeContato+'</h5>');
}

function selectContato(loginContato){	
	$("#historicoConversa").remove();
	console.log('carregando historico contato: '+loginContato);
	loginContatoSelecionado = loginContato;
	$("#historicoConversaPai").append('<div id="historicoConversa"></div>');	
	
	$.ajax({
		type : "GET",			
		url : urlRest + 'chatService/getHistoricoConversa/'+usuarioLogado+'/'+loginContato,
		success : function(dados) {
			for (var i = 0; i < dados.length; i++) {
				var msg = dados[i];				
				addConversaHistorico(msg);
			}
		}, //END success
		error : function(e) {				
			alert('Erro: Não foi possível obter os dados do Web Service.');
			
		} // END error
	}); // END $.ajax	

}

function pesquisarContatosPorApelidoOuLogin(){
	var filtro = $("#campoPesquisaContato").val();	
	if(!filtro){
		alert('Digite algo para pesquisar.');
		return false;
	}

	$("#resultadoTabelaPesquisa").remove();
	$("#tabelaPesquisa").append('<tbody id="resultadoTabelaPesquisa"></tbody>');					

	$.ajax({
		type : "GET",			
		url : urlRest + 'usuarioService/getUsuariosPorApelidoOuLogin/'+filtro,
		success : function(dados) {
			for (var i = 0; i < dados.length; i++) {
				var apelido = dados[i].apelido;
				var login = dados[i].login;

				var btAdicionar = '<button type="button" class="btn btn-primary" onclick="adicionarContato(\''+login+'\');">Adicionar</button>';
				var linhaTabela = '<tr>';
				linhaTabela += '<td style="width: 83%">';
				linhaTabela += '<h4>'+apelido+'</h4>';
				linhaTabela += '</td>';
				linhaTabela += '<td>';
				linhaTabela += btAdicionar;
				linhaTabela += '</td>';
				linhaTabela += '</tr>';

				$("#resultadoTabelaPesquisa").append(linhaTabela);								
			}			

		}, //END success
		error : function(e) {				
			alert('Erro: Não foi possível obter os dados do Web Service.');
			
		} // END error
	}); // END $.ajax

}

function formatDate(dt) {
    var data = new Date(dt),
        dia = data.getDate(),
        mes = data.getMonth() + 1,
        ano = data.getFullYear(),
        hora = data.getHours(),
        minutos = data.getMinutes()        
    
    return [dia, mes, ano].join('/') + ' ' + [hora, minutos].join(':');
}



