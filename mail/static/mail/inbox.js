document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  document.querySelector('#compose-form').addEventListener('submit' , send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
});



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#mail-details').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function view_mail(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#mail-details').style.display = 'block';

      document.querySelector('#mail-details').innerHTML = `
        <ul class = "list-group">
          <li class = "list-group-item"> <strong> From:  </strong>${email.sender} </li>
          <li class = "list-group-item"> <strong>To: </strong> ${email.recipients}</li>
          <li class = "list-group-item"> <strong>Subject: </strong> ${email.subject}</li>
          <li class = "list-group-item"> <strong>Time: </strong> ${email.timestamp}</li>
          <li class = "list-group-item"> ${email.body}</li>
        </ul>
      `
    // when it read change color
      if(!email.read){
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
      }
      //archive/unarchive
      const archive_btn = document.createElement('button');
      archive_btn.innerHTML = email.archived ? "unarchive" : "archive";
      archive_btn.className = email.archived ? "btn btn-success" : "btn btn-dark";

      

      const replay_btn = document.createElement('button');
      replay_btn.innerHTML ="Replay"

      replay_btn.className = "btn btn-info" ;
      replay_btn.addEventListener('click', function(){
          compose_email();
          document.querySelector('#compose-recipients').value = email.sender;
          let subject = email.subject;
          if (subject.split(' ',1)[0] != "Re:"){
            subject = "Re: " +email.subject;
          }
          document.querySelector('#compose-subject').value = subject;
          document.querySelector('#compose-body').value = ` On ${email.timestamp} - ${email.sender} sent: ${email.body}`;
      });
      document.querySelector('#mail-details').append(replay_btn);

      archive_btn.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived:!email.archived
          })
        })
        .then(()=> {load_mailbox('archive')})
      });
      document.querySelector('#mail-details').append(archive_btn);

  });

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail-details').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(singleMail => {
      const newMail = document.createElement('div');
      newMail.className = "list-group-item ";
      newMail.innerHTML = ` 
      <h6>From: ${singleMail.sender}</h6>
      <h5>Subject: ${singleMail.subject}</h5>
      <p>${singleMail.timestamp}</p> `;
      //changing the background-color
      newMail.className = singleMail.read ? 'read' : 'unread';

      newMail.addEventListener('click',function(){
        view_mail(singleMail.id)
      });
    
      document.querySelector('#emails-view').append(newMail);
    });

});
}


function send_mail(event) {
  event.preventDefault();
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value ;
  const body = document.querySelector('#compose-body').value ;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject:subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
}

