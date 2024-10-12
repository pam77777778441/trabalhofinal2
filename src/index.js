const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')


const app = express()
const PORT = 6000
let newUser 
let users = []
let messages = []
let nextUser = 1
let nextMessage = 1

app.use(cors())
app.use(express.json())

//---------------- ENDPOINT VERIFICACAO -----------

app.get('/', (req, res) =>{
    res.send('Bem vindo à aplicação')
})

//------------------ ENDPOINT RELACIONADOS A PESSOAS USUÁRIAS ------------------


//---------------- ENDPOINT SIGNUP -----------

app.post('/signup', async (req, res) =>{

    const name = req.body.name
    const email = req.body.email
    const password = req.body.password

    // Validação se o nome é passado
    if(!name){
       return res.status(400).send(JSON.stringify({ Mensagem: "Por favor, verifique se passou o nome" }))
    }

    // Validação se o email é passado
    if(!email){
        return res.status(400).send(JSON.stringify({ Mensagem: "Por favor, verifique se passou o email" }))
    }

    // Verifica se o email já está cadastrado no banco de dados
    let findEmail = users.find(user => user.email === email)

    // Se o email já está no banco de dados, envia uma mensagem para a pessoa usuaria
    if(findEmail){
       return res.status(400).send(JSON.stringify({ Mensagem: "Email já cadastrado, insira outro ." }))
    }

    // Validação se a senha foi passada
    if(!password){
        return res.status(400).send(JSON.stringify({ Mensagem: "Senha da pessoa usuária inválida.Favor inserir dado" }))
    }

    // Se os dados satisfazem todas as validações , cria uma nova pessoa usuária
    if(name && email && password ){
        // Utiliza o bcrypt para criptografar a senha 
        let hashedPassword = await bcrypt.hash(password,10)

        //Cria uma nova pessoa usuária 
        let newUser = {
            id: nextUser,
            name:name,
            email:email,
            password:hashedPassword
        }

        // Insere essa nova pessoa usuária na lista de usuário
        users.push(newUser)

        // Soma 1 após inserir a pessoa usuária no cadastro
        nextUser++

        res.status(201).send(JSON.stringify({ Mensagem: `Seja bem vinde ${newUser.name} ! Pessoa usuária registrada com sucesso!` }))
    }

})

//---------------- ENDPOINT LOGIN -----------

app.post('/login', async (req,res)=>{
    const email = req.body.email
    const password = req.body.password
    //Verifica se o email foi passado
    if(!email){
        return res.status(400).send(JSON.stringify({ Mensagem: "Insira um e-mail válido" }))
    }

    // Busca o email no banco de dados
    let findEmail = users.find(user => user.email === email)

    // Se o email não é encontrado, manda uma mensage para a pessoa usuaria
    if(!findEmail){
      return res.status(400).send(JSON.stringify({ Mensagem: "Email não encontrado em nossa base de dados." }))
    }
    // Verifica se não tá passando a senha
    if(!password){
        return res.status(400).send(JSON.stringify({ Mensagem: "Insira uma senha válida" }))
    }
    // Se econtra o email registrado, compara com o bcrypt a senha
    if(findEmail){
        let passwordMatched = await bcrypt.compare(password, findEmail.password)

        if(passwordMatched){
           return res.status(200).send(JSON.stringify({ Mensagem: `Seja bem vinde ${findEmail.name} ! Pessoa usuária logada com sucesso!` }))
        }else{
            return res.status(400).send(JSON.stringify({ Mensagem: `Credenciais não válidas. Verifique os dados` }))

        }
    }
})


//------------------ ENDPOINT RELACIONADOS A MENSAGENS ------------------

//------------------ CRIAR MENSAGENS ------------------

app.post('/message/:email',(req,res)=>{
    const title = req.body.title
    const description = req.body.description
    const email = req.params.email
    //Verifica se passou o email
    if(!email){
       return res.status(400).send(JSON.stringify({ Mensagem: "Por favor, verifique se passou um email válido" }))
    }
    //Busca o email passado no banco de dados
    let findEmail = users.find(user => user.email === email)
    //Casso o email não exista no banco de dados, fornece uma mensagem
    if(!findEmail){
        return res.status(400).send(JSON.stringify({ Mensagem: "Email não encontrado em nossa base de dados." }))
    }
    //Verifica se a pessoa passou o titulo da mensagem
    if(!title){
        return res.status(400).send(JSON.stringify({ Mensagem: "Por favor, verifique se passou um titulo válido" }))
    }
    //Verifica se passou a descricao da mensagem
    if(!description){
        return res.status(400).send(JSON.stringify({ Mensagem: "Por favor, verifique se passou uma descrição válida" }))
    }
    //Se essas duas informações forem passadas, cria uma nova mensagem
    if(title && description){
        let newMessage = {
            id: nextMessage,
            title: title,
            description: description
        }

        messages.push(newMessage)

        nextMessage ++ 

       return res.status(201).send(JSON.stringify({ Mensagem: "Mensagem criada com sucesso!" }))
    }
})


//------------------ LER MENSAGENS ------------------

app.get('/message/:email',(req,res)=>{
    const email = req.params.email
    //Verifica se passou o email
    if(!email){
        return res.status(400).send(JSON.stringify({ Mensagem: "Por favor, verifique se passou um email válido" }))
    }
    //Busca esse email no banco de dados
    let findEmail = users.find(user => user.email === email)

    //Se esse email não é encontrado no banco de dados, manda uma mensagem
    if(!findEmail){
       return res.status(400).send(JSON.stringify({ Mensagem: "Email não encontrado, verifique ou crie uma conta" }))
    }
    //Manda uma mensagem se não existir mensagem no banco de dados
    if(messages.length ===0){
       return res.status(400).send(JSON.stringify({ Mensagem: "Não há mensagem registradas. Por gentileza, registre uma mensagem." }))
    }
    //Mapeia as informacoes da mensagem 
    const listOfMessage = messages.map(message =>{
        const data = ` ID: ${message.id} - Título: ${message.title} - Desrição: ${message.description}`
        return data
    })
    //Retorna a resposta
    return res.status(200).send(JSON.stringify({ Mensagem: `Seja bem-vinde! As mensagens cadastradas são : ${listOfMessage}` }))
})

//------------------ ATUALIZAR MENSAGENS ----------------

app.put('/message/:id',(req,res)=>{

    const id = Number(req.params.id)
    const title = req.body.title
    const description = req.body.description
    //Verifica se o id foi passado
    if(!id){
       return res.status(400).send(JSON.stringify({ Mensagem: "Por favor, informe um id válido da mensagem"}))
    }
    //Busca a mensagem com aquele id no nosso banco de dados
    const findMessageIdIndex = messages.findIndex(message => message.id === id)
    //Findindex, se não encontra retorna -1
    if(findMessageIdIndex === -1) {
       return res.status(400).send(JSON.stringify({ Mensagem: `Mensagem cujo o id é : ${id}, não foi localizado no nosso banco de dados`}))
    }
    //Verifica se passou o titulo da mensagem
    if(!title){
        return res.status(400).send(JSON.stringify({ Mensagem: 'Por favor, verifique se passou um titulo válido'}))
    }
    //Verifica se passou a descricao para a mensagem
    if(!description){
        return res.status(400).send(JSON.stringify({ Mensagem: 'Por favor, verifique se passou uma descrição válida'}))
    }
    // Encontrou a mensagem atualiza as informações
    if(findMessageIdIndex !== -1){
        const message = messages[findMessageIdIndex]
        message.title = title,
        message.description = description 
        res.status(200).send(JSON.stringify({ Mensagem: ` Mensagem atualizada com sucesso ! Título:  ${message.title} , Descrição: ${message.description}`}))
    }

})

//------------------ DELETAR MENSAGENS ----------------

app.delete('/message/:id',(req,res)=>{
    const id = Number(req.params.id)
    //Verifica se passou o id 
    if(!id){
        return res.status(400).send(JSON.stringify({ Mensagem: `Por favor, informe um id válido da mensagem`}))
    }
    //Busca a mensagem por um id especifico
    const findMessageIdIndex = messages.findIndex(message => message.id === id)
    // Caso não encontre , forneça a mensagem
    if(findMessageIdIndex === -1) {
        return res.status(400).send(JSON.stringify({ Mensagem: `Mensagem cujo o id é : ${id}, não foi localizado no nosso banco de dados`}))
    }
    //Se encontrar , deleta a mensagem com o método splice.
    if(findMessageIdIndex !== -1){
        messages.splice(findMessageIdIndex,1)
        return res.status(200).send(JSON.stringify({ Mensagem: `Mensagem apagada com sucesso`}))
    }

})

//---------------- ENDPOINT OUVIR PORTA -----------
app.listen(PORT,()=>  console.log('Servidor rodando na porta 6000'))