```javascript
let data = {
  users: [
    {
      userId: 1,
      nameFirst: 'Hayden',
      nameLast: 'Smith',
      email: 'hayden.smith@unsw.edu.au',
      password: 'hayden123',
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1,
    }
  ],
  quizzes: [
    {
      quizId: 1,
      name: 'My Quiz',
      timeCreated: 1683125870,
      timeLastEdited: 1683125871,
      description: 'This is my quiz',
      quizOwnedby: 1,
    }    
  ]
}
```

<!-- [Optional] short description:  -->

interface QuizInfoReturn {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: Question[];
  duration: number;
}

interface ErrorObject {
  error: string;
}
