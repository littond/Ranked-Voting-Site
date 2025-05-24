export function validChoices(choices) {
  let valid = [];

  choices.forEach(choice => {
    console.log(choice, choice.length);
    if (choice.length >= 1) {
      valid.push(choice);
    }
  });
  console.log("valid", valid);
  return valid;
} 