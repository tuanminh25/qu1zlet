
function adminQuizCreate(authUserId, name, description) {
    return {
        quizId: 2,
    }
  }

  function adminQuizRemove(authUserId, quizId) {
    return {
    }
  }

function adminQuizList(authUserId) {
    return { quizzes: [
        {
          quizId: 1,
          name: 'My Quiz',
        }
      ]
    }
}

