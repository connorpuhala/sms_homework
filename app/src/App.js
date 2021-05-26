import React, { Component } from 'react';
import './App.css';
import { Button, Container, Divider, Dropdown, Form, Grid, Header, Icon, Image, Item, ItemGroup, Popup, Tab } from 'semantic-ui-react';

// Seed Data
// Seed Data for Users
let user_1 = {
  "id": 1,
  "username": "ElizaBlank",
  "password": "puppy2",
  "company_id": 1
}

let user_2 = {
  "id": 2,
  "username": "LadyGaga",
  "password": "musicismylife",
  "company_id": 2
}

let user_list = [user_1, user_2]

// Seed Data for Products
let product_1 = {
  "id": 1,
  "name": "Ficus Altissima",
  "image": "plant1",
  "company_id": 1
}

let product_2 = {
  "id": 2,
  "name": "The Easy Care Bundle",
  "image": "plant2",
  "company_id": 1
}

let product_3 = {
  "id": 3,
  "name": "The Monstera & Hoya Bundle",
  "image": "plant3",
  "company_id": 1
}

let product_4 = {
  "id": 4,
  "name": "PHD HYBRID LIP OIL STAIN",
  "image": "makeup1",
  "company_id": 2
}

let product_5 = {
  "id": 5,
  "name": "THE EDGE PRECISION BROW PENCIL",
  "image": "makeup2",
  "company_id": 2
}

let product_6 = {
  "id": 6,
  "name": "FOUR-WAY SHADOW PALETTE",
  "image": "makeup3",
  "company_id": 2
}

let product_7 = {
  "id": 7,
  "name": "LE MONSTER MATTE LIP CRAYON",
  "image": "makeup4",
  "company_id": 2
}

let product_list = [product_1, product_2, product_3, product_4, product_5, product_6, product_7]

// SMS Message Templates
const shippedTemplate = {
  subject: 'Shipped',
  body: 'Your product has been shipped and is on the way! Thank you for shopping with us.',
}
const delayedTemplate = {
  subject: 'Delayed',
  body: 'Unfortunately, there was a delay with getting your product shipped out. We will contact you shortly with more details.',
}


// Database calls (CRUD) - 'Read' takes place later on as a component function
function postMessage (newMessage) {
  let post_message_request = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newMessage)
  }
  return fetch('http://localhost:5000/add', post_message_request)
}

function editMessage (editedMessage) {
  let patch_message_request = {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(editedMessage)
  }
  return fetch('http://localhost:5000/edit/' + editedMessage.id, patch_message_request)
}

function deleteMessage (deletedMessage) {
  let delete_message_request = {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deletedMessage)
  }
  return fetch('http://localhost:5000/remove/' + deletedMessage.id, delete_message_request)
}

// Send text message using Twilio
function sendMessage (messageToSend) {
  let sendMessageRequest = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      messageToSend
    )
  };
  fetch('http://localhost:5000/send-message/', sendMessageRequest)
}



// Application Componenets
// Main App Container
class MainAppContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      view : <LoginView login={this.showManagerView}/>,
      user : {},
      products : [],
      all_messages : []
    }
  }

  showManagerView = (user, chosenProduct) => {
    let productsInCompany = []
    product_list.forEach((product) => {
       if (product.company_id === user.company_id) {
         productsInCompany.push(product)
       }
    })

    if (!chosenProduct) {
      chosenProduct = productsInCompany[0]
    }
    

    this.setState({
      user : user,
      products : productsInCompany,
      view : <SMSManagerView user={user} chosenProduct={chosenProduct} products={productsInCompany} showEditorView={this.showEditorView} showLoginScreen={this.showLoginScreen}/>
    })
  }

  showLoginScreen = () => {
    this.setState({
      user : null,
      products : [],
      view : <LoginView login={this.showManagerView}/>
    })
  }

  showEditorView = (message, product) => {
    this.setState({
      view : <MessageEditorView message={message} user={this.state.user} product={product} showManagerView={this.showManagerView} updateMessages={this.updateMessages}/>
    })
  }

  render () {
    return (
      <div>
        <Header></Header>
        <Container>
          <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
            <Grid.Column style={{ maxWidth: 550 }}>
              {this.state.view}
            </Grid.Column>
          </Grid>
        </Container>
      </div>
    )
  }
} 

// Main Views
class LoginView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: ''
    }
  }

  myChangeHandler = (e) => {
    let nam = e.target.name;
    let val = e.target.value;
    this.setState({[nam]: val});
  }

  checkID = () => {
    user_list.forEach((user) => {
      if ((this.state.username === user.username) && (this.state.password === user.password)) {
          this.props.login(user)
      }
    })
  }

  render () {
    return (
      <div>
        <Header as='h2' color='teal' textAlign='center'>
          Log-in to your account
        </Header>
        <Form>
            <Form.Input 
              fluid 
              icon='user' 
              iconPosition='left' 
              placeholder='Username'
              name='username'
              onChange={this.myChangeHandler} 
            />
            <Form.Input 
              fluid
              icon='lock'
              iconPosition='left'
              placeholder='Password'
              type='password'
              name='password'
              onChange={this.myChangeHandler}
            />
          <button className="ui button" onClick={this.checkID}>Log-in</button>
        </Form>
      </div>
    )
  }
} 

class SMSManagerView extends Component {
  constructor(props) {
    super(props);

    let loadedProject = {}
    if (this.props.chosenProduct) {
      loadedProject = this.props.chosenProduct
    } else {
      loadedProject = this.props.products[0]
    }

    this.state = {
      product : loadedProject,
      selected: null,
      all_messages : []
    }
  }

  componentDidMount(){
    this.updateMessages()
  }

  updateMessages = () => {
    let read_message_request = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify()
    }
    
    fetch('http://localhost:5000/', read_message_request)
    .then(response => response.json())
    .then(response => {
      this.setState({
        all_messages: response
      })
    })
    .catch(err => { console.log(err); 
    });
  }

  // Convert company-specific product list into correct format for dropdown form
  createProductListForDropdown = () => {
    let dropdownProductList = []
    this.props.products.forEach((product) => {
      let newProductOption = { key: product.id, value: product.id, flag: product.name, text: product.name }
      dropdownProductList.push(newProductOption)
    })
    return dropdownProductList
  }

  onProductChoiceFromDropdown = (e, data) => {
    this.setState({ selected: data.value });

    this.props.products.forEach((product) => {
      if (product.id === data.value) {
        this.setState({product: product})
      }
    })
  }

  logoutPressed = () => {
    this.props.showLoginScreen()
  }

  newButtonPress = () => {

    let new_blank_message = {
      "message_body": "",
      "phone_number": "",
      "date": new Date().toLocaleString(),
      "message_type": "draft",
      "product_id": this.state.product.id,
      "user_id": this.props.user.id
    }

    this.props.showEditorView(new_blank_message, this.state.product)
  }

  render () {
    const { selected } = this.state;

    let panes = [
      { menuItem: 'Drafts', render: () => <Tab.Pane><MessagePreviews user={this.props.user} list_of_messages={this.state.all_messages.filter(lom => lom.message_type=='draft')} type='draft' product={this.state.product} showEditorView={this.props.showEditorView}/></Tab.Pane> },
      { menuItem: 'Sent', render: () => <Tab.Pane><MessagePreviews user={this.props.user} list_of_messages={this.state.all_messages.filter(lom => lom.message_type=='sent')} type='sent' product={this.state.product} showEditorView={this.props.showEditorView}/></Tab.Pane> },
    ]

    return (
      <div>
      <Header as='h2' color='teal' textAlign='center'>
        SMS Management Hub
      </Header>
      <div className='left'>
        <Button onClick={this.logoutPressed} size='tiny' icon labelPosition='left'>
          <Icon name='angle left' />
          Logout
        </Button>
      </div>
      <Header>Product</Header>
      <Divider />
      <ProductPreview product={this.state.product}/>   
      <Divider />
      <Dropdown
          placeholder='Select Product'
          fluid
          // search
          selection
          value = {selected}
          onChange={this.onProductChoiceFromDropdown}
          options={this.createProductListForDropdown()}
        />
      <div className='right' style={{ 'padding-top': '15px' }}>
        <Button icon labelPosition='right' onClick={this.newButtonPress}>
          New
          <Icon name='edit' />
        </Button>
      </div>
      <Tab panes={panes} />
    </div>
    )
  }
} 

class MessageEditorView extends Component {
  constructor(props) {
    super(props);

    if (this.props.message) {
      this.state = {
        body : this.props.message.message_body,
        number : this.props.message.phone_number,
        type : this.props.message.message_type,
        product : this.props.product
      }
    } else {
      this.state = {
        body : '',
        number : '',
        type : "draft",
        product : this.props.product
      }
    }    
  }

  fillTemplate = (templateChoice) => {
    if (templateChoice === 0) {
      this.setState({ 
        body : shippedTemplate.body
      });
    } else if (templateChoice === 1) {
      this.setState({ 
        body : delayedTemplate.body
      });
    }
  }

  updateBody = (e) => {
    this.setState({body: e.target.value});
  }

  updateNumber = (e) => {
    this.setState({number: e.target.value});
  }

  backbuttonPress = () => {
    this.props.showManagerView(this.props.user, this.state.product)
  }

  saveButtonPress = () => {

    let rightNow = new Date().toLocaleString()
    let phone = ''
    if (this.state.number) {
      phone = this.state.number
    } else {
      phone = ''
    }
    
    if (this.props.message.id) {
      // Edit
      let edited_message = {
        "id": this.props.message.id,
        "message_body": this.state.body,
        "phone_number": phone,
        "date": rightNow,
        "message_type": "draft",
        "product_id": this.state.product.id,
        "user_id": this.props.user.id
      }
      editMessage(edited_message)

    } else {
      // Create
      let new_message = {
        "message_body": this.state.body,
        "phone_number": phone,
        "date": rightNow,
        "message_type": "draft",
        "product_id": this.state.product.id,
        "user_id": this.props.user.id
      }
      postMessage(new_message)
    }
  }

  sendButtonPress = () => {
    let rightNow = new Date().toLocaleString()
    let message_for_sending
    if (!this.props.message.id) {
      message_for_sending = {
        "message_body": this.state.body,
        "phone_number": this.state.number,
        "date": rightNow,
        "message_type": "sent",
        "product_id": this.state.product.id,
        "user_id": this.props.user.id
      }
      postMessage(message_for_sending)
    } else {
      message_for_sending = {
        "id": this.props.message.id,
        "message_body": this.state.body,
        "phone_number": this.state.number,
        "date": rightNow,
        "message_type": "sent",
        "product_id": this.state.product.id,
        "user_id": this.props.user.id
      }
      editMessage(message_for_sending)
    }
    debugger
    sendMessage (message_for_sending)
    this.props.showManagerView(this.props.user, this.state.product)
  }
  
  render() {

    let saveDraftButton
    let sendText = "Send Again"
    if (this.props.message.message_type == 'draft' ) {
      saveDraftButton = <Button type="submit" onClick={this.saveButtonPress}>Save Draft</Button>
      sendText = "Send"
    }

    return (
      <div>
        <Header as='h2' color='teal' textAlign='center'>
          SMS Message Editor
        </Header>
        <div className='message-header'>
          <button className="ui icon button" onClick={this.backbuttonPress}><i aria-hidden="true" className="left chevron icon"></i></button>
          <div className="right">
          <Popup trigger={<Button>Templates</Button>} flowing hoverable>
            <Grid centered divided columns={2}>
              <Grid.Column textAlign='center'>
                <Header as='h4'>Product Has Been Shipped!</Header>
                <Button onClick={() => this.fillTemplate(0)}>Choose</Button>
              </Grid.Column>
              <Grid.Column textAlign='center'>
                <Header as='h4'>Shipment Delayed</Header>
                <Button onClick={() => this.fillTemplate(1)}>Choose</Button>
              </Grid.Column>
            </Grid>
          </Popup>   
          </div>
        </div>
        <Form style={{ 'padding-top': '10px '}}>
          <Divider />
          <ItemGroup>
            <ProductPreview product={this.state.product}/> 
          </ItemGroup>
          <Divider />
          <Form.TextArea label='Message' placeholder='Write your shipping message here...' value={this.state.body} onChange={this.updateBody}/>
          <Form.Field>
            <label>Recipient Phone Number</label>
            <input placeholder='xxxxxxxxxx' value={this.state.number} onChange={this.updateNumber}/>
          </Form.Field>
          {saveDraftButton}
          <Button type="submit" onClick={this.sendButtonPress} color='teal' >{sendText}</Button>
        </Form>
      </div>
    )
  }
}

// Subcomponenets
class ProductPreview extends Component {
  constructor(props) {
    super(props);

  }

  render () {

    let image_src = '/images/' + this.props.product.id + '.png'

    return (
      <Item.Group>
        <Item>
          <Item.Image size='tiny' src={image_src} />
          <Item.Content verticalAlign='middle'>
            <Item.Description as='a'>{this.props.product.name}</Item.Description>
          </Item.Content>
        </Item>
      </Item.Group>
    )
  }
}

class MessagePreviews extends Component {
  constructor(props) {
    super(props);

    console.log ('chosen props',props, this.props)

    this.state = {
      list_of_messages : props.list_of_messages
    }
    
  }

  componentDidMount(){
    this.updateMessages();
  }


  updateMessages = () => {
    console.log('refresh triggered')
    let read_message_request = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify()
    }
    
    fetch('http://localhost:5000/', read_message_request)
    .then(response => response.json())
    .then(response => {
      this.setState({
        list_of_messages : response
      })


    })
    .catch(err => { console.log(err); 
    });
  }

render () {

  let message_list = []
  

  if (Object.keys(this.props).includes('user')) {

    // this.props.list_of_messages.forEach((message) => {
    //   console.log('running')
    //   if (message.user_id === this.props.user.id) {
    //     if (message.product_id === this.props.product.id) {
    //       if (message.message_type === this.props.type) { console.log('2running')
    //         message_list.push(message)
    //       }
    //     }
    //   }
    // })
    
    message_list = this.state.list_of_messages.filter(message => {
      let result = false;
        if (message.user_id == this.props.user.id && message.product_id == this.props.product.id && message.message_type == this.props.type)
          result = true;
      return result 
    })
  }else {
    console.log('skip message_list because user not defined in props')
  }
  console.log('selected product =', this.props.product)

  let message_component_list = message_list.map((chosenMessage) => {
  return <Message message={chosenMessage} product={this.props.product} showEditorView={this.props.showEditorView} refresh={this.updateMessages}/>
  })

  return (
    <div>
      <div>
        <ItemGroup divided>
          {message_component_list}
        </ItemGroup>
      </div>    
    </div>
  )
}

}

class Message extends Component {
  constructor(props) {
    super(props);

  }

  messageEditor = () => {
    this.props.showEditorView(this.props.message, this.props.product)
  }

  trashButtonPress = () => {
    // Delete

    deleteMessage(this.props.message).then(res => {
      console.log('delete complete, reconstructing messages list')
      this.props.refresh();
    })
  }

  render () {

    let button_text = 'View'
    let trash_button = null
    if (this.props.message.message_type === 'draft') {
      button_text = 'Edit'
      trash_button = <Button icon size='mini' onClick={this.trashButtonPress}><Icon name='trash' /></Button>
    }

    return (
      <Item>
        <Item.Content>
          <div className="right"><label>{this.props.message.date}</label></div>
          <Item.Description>
            {this.props.message.message_body}
          </Item.Description>
          <Item.Meta>
            {this.props.message.phone_number}
          </Item.Meta>
          
          <Item.Extra>
            <div className="right">
              {trash_button}<button className="ui mini button" onClick={this.messageEditor}>{button_text}</button>
            </div>
          </Item.Extra>
        </Item.Content>
      </Item>
    )
  }
}

// App
function App() {

  return (
    <div>
      <MainAppContainer />
    </div>
  );
}

export default App;
