var urlRest = 'http://localhost:8080/talkserver/rest/';

function salvar(){
	var apelido = $('#apelido').val();
	var login = $('#login').val();
	var senha = $('#senha').val();
	
	$.ajax({
		type : "POST",			
		url : urlRest + 'usuarioService/inserirNovo/'+apelido+'/'+login+'/'+senha,
		success : function(dados) {
			alert('Usuário cadastrado com sucesso!');			
			window.location = "http://localhost:8080/talk/index.html";
		}, //END success
		error : function(e) {	
			console.log(e.status);
			if (e.status == 400) {
				alert('O login informado já existe.');
			}
			else{
				alert('Erro: Não foi possível obter os dados do Web Service.');	
			}						
		} // END error
	}); // END $.ajax
}