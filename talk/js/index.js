function login(){
	var usuario = $('#usuario').val();
	var senha = $('#senha').val();

	$.ajax({
		type : "GET",			
		url : 'http://localhost:8080/talkserver/rest/loginService/login/'+usuario+'/'+senha,
		success : function(dados) {
			console.log(dados);				
			if(dados == 'true'){
				sessionStorage.setItem("login", usuario);
				window.location = "http://localhost:8080/talk/pages/chat.html";
			}
			else{
				alert('Usuário ou senha estão incorretos.');
			}				

		}, //END success
		error : function(e) {				
			alert('Erro: Não foi possível obter os dados do Web Service.');
			
		} // END error
	}); // END $.ajax
}