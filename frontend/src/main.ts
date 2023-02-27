import './assets/scss/style.scss'

/**
 * @todo WHEN 'gå vidare' is clicked, submit user to database
 * validate nickname
 *  */

document.querySelector('#nickname-form')?.addEventListener('submit', (e) => {
    e.preventDefault()

    // Save nickname and emit to the server
    const nickname = (document.querySelector('#nickname-input') as HTMLInputElement).value

    if (!nickname) {
        document.querySelector('.nickname-label')!.innerHTML = 'Skriv in ett nickname'
        return
    }

    console.log(nickname)
})