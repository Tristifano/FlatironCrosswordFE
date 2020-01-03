let orientation = true
let puzzle = {}
let timer;
let userName;


document.addEventListener("DOMContentLoaded", () => {
    crosswordFetch()  
})



const crosswordFetch = () => {
    fetch('http://localhost:3000/puzzles/1')
    .then(resp => resp.json())
    .then(json => {
        puzzle = json
        
        generateCrossword()
        fillToolbar()
        generateClues()
        addCellHighlightListeners()
        addClueNumbers()
        configureTimer()

    })
}

const generateCrossword = () => {
    for(i = 0; i < puzzle.cells.length; i++){
        let cell = document.createElement('div')
        cell.className = "crossword-cell", cell.id = `crossword-cell-${puzzle.cells[i].index}`;
        
        if(puzzle.cells[i].letter !== "!") {
            let numberDiv = document.createElement('div')
            numberDiv.className = "cell-number", numberDiv.id = `cell-number-${puzzle.cells[i].index}`
            let textInput = document.createElement('input')
            textInput.id = `cell-input-${puzzle.cells[i].index}`, textInput.className = 'cell-input', textInput.maxLength = 1, cell.style.backgroundColor = 'white';
            cell.append(textInput)
            cell.append(numberDiv)
            numberDiv.addEventListener('click', () => highlight(numberDiv.id.slice(12)))
            textInput.addEventListener('dblclick',()=>{
                orientation = !orientation
                unselect()
                highlight(textInput.id.slice(11))
                console.log(orientation)
            })
            textInput.addEventListener('keydown', (event) => {
                let key = event.keyCode
                if (key === 8 && event.target.value) {
                    debugger
                    event.target.value = ''
                } else if(key === 8) {
                    lastInput(textInput)
                } 
            })
            textInput.addEventListener('keyup', (event) => {
                console.log(event.keyCode, event.target)
                let key = event.keyCode
                if(key >= 65 && key <= 90 && event.target.value){
                    event.target.value = String.fromCharCode(key)
                    nextInput(textInput)
                    checkGame()
                } else if(key >= 65 && key <= 90) {
                    nextInput(textInput)
                    checkGame()
                } else if(key === 8) {
                } else {
                    event.target.value = ''
                }
            })
        }
        document.getElementById('crossword-container').append(cell)
    }
}

const configureTimer = () => {
    let minutes = 0,
        tens = 0,
        ones = 0
        timerDiv = document.getElementById('timer-div')

        timer = setInterval(() => {
        ones++
        if (ones === 10) {
            ones =0
            tens++
            if(tens === 6) {
                tens = 0
                minutes++
            }
        } 
        timerDiv.innerText = `${minutes}:${tens}${ones}`
    }, 1000);
}

const addClueNumbers = () => {
    puzzle.clues.forEach((clue) => {
        console.log(clue.cells[0].index, clue.number)
        let cellNumber = document.getElementById(`cell-number-${clue.cells[0].index}`)
        cellNumber.innerText = clue.number
    })
}

const addCellHighlightListeners = () => {
    let cells = document.querySelectorAll('.crossword-cell')
    cells.forEach((cell) => {
        if(cell.hasChildNodes()) {
            let textInput = cell.firstChild
            textInput.addEventListener("focus", () => highlight(textInput.id.slice(11)))
            textInput.addEventListener("blur", unselect)
        }
    })
}

const addNewUserListener = () => {
    let submitBtn = document.getElementById("new-user-submit")
    submitBtn.addEventListener('mouseup', ()=> {
        let textInput = document.getElementById('input-user-name')
        userName = textInput.value
        $('user-submit').modal('hide')
        userPost()
    })
}

const showStartModal = () => {
    $('start').modal()
}

const userPost = () => {
    fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
            'content-type':'application/json',
            'accept':'application/json'
        },
        body: JSON.stringify({
            name: userName
        })
    })
    .then(r=>r.json())
    .then((user) => {
        $('user-submit').modal('hide')
        showStartModal()
    })
}

const fillToolbar = () => {
    let resetButton = document.createElement('button'),
        timerDiv = document.createElement('div'),
        toolbar = document.getElementById('toolbar'),
        settingsButton = document.createElement('button')
    resetButton.innerHTML = '<img src="https://img.icons8.com/ios-glyphs/40/000000/recurring-appointment.png">', 
    resetButton.id = 'reset-button', resetButton.className = "tool-item"
    timerDiv.id = 'timer-div', timerDiv.innerText = '0:00', timerDiv.className = "tool-item" 
    
    
    settingsButton.innerHTML ='<img src="https://img.icons8.com/ios/32/000000/settings.png"></img>',
    settingsButton.id = 'settings-button', settingsButton.className = "tool-item", settingsButton.dataset.toggle = "modal",
    settingsButton.dataset.target = "#user-edit-modal",settingsButton.type = 'button'
    
    toolbar.append(resetButton,timerDiv,settingsButton)
    addToolbarButtonListener(resetButton)
}

const addToolbarButtonListener = (reset) => {
    reset.addEventListener('click', resetGame)

}

const newUser = () => {
    $("#user-submit").modal()
}

const highlight = (index) => {
    let selectedCell = document.getElementById(`crossword-cell-${index}`),
        selectedInput = document.getElementById(`cell-input-${index}`),
        selectedClue,
        clueIndices;
    selectedClue = findClue(index)
    let otherClue = findOtherClue(index)
    clueIndices = selectedClue.cells.map(c => c.index)
    let clueDivId = orientation ? `across-outer-clue-${selectedClue.number}` : `down-outer-clue-${selectedClue.number}`,
        numDivId = orientation ? `down-num-div-${otherClue.number}` : `across-num-div-${otherClue.number}`
    let clueDiv = document.getElementById(clueDivId),
        numDiv = document.getElementById(numDivId)
    
   
    clueDiv.style.backgroundColor = 'lightskyblue'
    numDiv.style.backgroundColor = 'lightskyblue'
    numDiv.scrollIntoView()
    clueDiv.scrollIntoView({behavior:"smooth"})

    
    clueIndices.forEach((ind) => {
        let otherCell = document.getElementById(`crossword-cell-${ind}`)    
        otherCell.style.backgroundColor = 'lightskyblue'
    })
    selectedCell.style.backgroundColor = 'yellow'
    selectedInput.focus()
    
}

const unselect = () => {
    let cells = document.querySelectorAll('.crossword-cell'),
        clueDivs = document.querySelectorAll('.outer-clue'),
        numDivs = document.querySelectorAll('.num-div')
    cells.forEach(cell => {
        if (cell.firstChild) {
            cell.style.backgroundColor = 'white'
        }
    })
    numDivs.forEach(div => div.style.backgroundColor = 'transparent')
    clueDivs.forEach(div => div.style.backgroundColor = 'white')
}

const findClue = (index) => {
    if(orientation) {
        let acrossClueId = puzzle.cells.find( cell => cell.index == index).across_word
        return puzzle.clues.find( clue => clue.direction === "across" && clue.id === acrossClueId)
    } else {
        let downClueId = puzzle.cells.find( cell => cell.index == index).down_word
        return puzzle.clues.find( clue => clue.direction === "down" && clue.id === downClueId)
    }
}

const findOtherClue = (index) => {
    if(orientation) {
        let downClueId = puzzle.cells.find( cell => cell.index == index).down_word
        return puzzle.clues.find( clue => clue.direction === "down" && clue.id === downClueId)
    } else {
        let acrossClueId = puzzle.cells.find( cell => cell.index == index).across_word
        return puzzle.clues.find( clue => clue.direction === "across" && clue.id === acrossClueId)
    }
}



const generateClues = () => {
    //GETTING HINT CONTAINERS
    let acrossContainer = document.getElementById('across-hints')
    let downContainer = document.getElementById('down-hints')

    //PUTTING ACROSS AND DOWN CLUES INTO THEIR OWN RESPECTIVE ARRAYS
    let acrossClues = puzzle.clues.filter( clue => clue.direction === 'across')
    let downClues = puzzle.clues.filter( clue => clue.direction === 'down')
   
    //CREATING HINT DIVS
    for(i = 0;i < acrossClues.length; i++) {
        let clue = acrossClues[i],
            outerClueDiv = document.createElement('div')
            outerClueDiv.className = 'outer-clue'
            outerClueDiv.id = `across-outer-clue-${clue.number}`
        let clueDiv = document.createElement('div'),
            numDiv = document.createElement('div'),
            clueFirstCell = clue.cells[0]


        clueDiv.id = `across-clue-${clue.number}`
        clueDiv.className = 'clue-div'
        clueDiv.innerText = `${clue.hint}`
        numDiv.id = `across-num-div-${clue.number}`
        numDiv.className = 'num-div'
        numDiv.innerText = `${clue.number}`
        
        numDiv.addEventListener('click', () => {
            orientation = true
            unselect()
            highlight(clueFirstCell.index)
        })
        clueDiv.addEventListener('click', () => {
            orientation = true
            unselect()
            highlight(clueFirstCell.index)
        })
        outerClueDiv.append(numDiv, clueDiv)
        acrossContainer.append(outerClueDiv)

    }

    for(i = 0;i < downClues.length; i++) {
        let clue = downClues[i],
            outerClueDiv = document.createElement('div')
            outerClueDiv.className = 'outer-clue'
            outerClueDiv.id = `down-outer-clue-${clue.number}`
        let clueDiv = document.createElement('div'),
            numDiv = document.createElement('div'),
            clueFirstCell = clue.cells[0]

        clueDiv.id = `down-clue-${clue.number}`
        clueDiv.classList.add('clue-div')
        clueDiv.innerText = `${clue.hint}`
        numDiv.id = `down-num-div-${clue.number}`
        numDiv.className = 'num-div'
        numDiv.innerText = `${clue.number}`


        clueDiv.addEventListener('click', () => {
            orientation = false
            unselect()
            highlight(clueFirstCell.index)
        })

        outerClueDiv.append(numDiv,clueDiv)
        downContainer.append(outerClueDiv)
    }

    
    
}


const lastInput = (input) => {
    let newInput = input
    if(orientation) {
        console.log(newInput.parentNode.previousSibling.firstElementChild)
        if (newInput.parentNode.previousSibling.firstElementChild === null) {
            let selectedCell = newInput.parentNode
            while(selectedCell.previousSibling.firstElementChild === null) {
                selectedCell = selectedCell.previousSibling
            }
            selectedCell.previousSibling.firstElementChild.focus()
        }
        newInput.parentNode.previousSibling.firstElementChild.focus()
    } else {
        let index = newInput.id.slice(11),
            nextIndex = Number(index) - 16
        newInput = document.getElementById(`cell-input-${nextIndex}`)
        if (newInput === null) {
            let selectedClue = findClue(index),
            clues = puzzle.clues,
            nextClue;
            for(let i=0;i<clues.length;i++){
                if(clues[i] === selectedClue){
                    nextClue = clues[i - 1]
                }
            }
            newInput = document.getElementById(`cell-input-${nextClue.cells[0].index}`)
            newInput.focus()
        }
        console.log(index,newInput)
        newInput.focus()
    }
}


const nextInput = (input) => {
    let newInput = input
    if (orientation) {
        if (newInput.parentNode.nextSibling.firstElementChild === null) {
            let selectedCell = newInput.parentNode
            while(selectedCell.nextSibling.firstElementChild === null) {
                selectedCell = selectedCell.nextSibling
            }
            selectedCell.nextSibling.firstElementChild.focus()
        }
        newInput.parentNode.nextSibling.firstElementChild.focus()
    } else {
        let index = newInput.id.slice(11),
            nextIndex = Number(index) + 16
        newInput = document.getElementById(`cell-input-${nextIndex}`)
        if (newInput === null) {
            let selectedClue = findClue(index),
                clues = puzzle.clues,
                nextClue;
                for(let i=0;i<clues.length;i++){
                    if(clues[i] === selectedClue){
                        nextClue = clues[i + 1]
                    }
                }
                newInput = document.getElementById(`cell-input-${nextClue.cells[0].index}`)
                newInput.focus()
        }
        console.log(newInput)
        newInput.focus()
    }
}

const checkGame = () => {
    let cells = puzzle.cells.filter(cell => cell.letter != '!' )
    let board = document.querySelectorAll('.cell-input')
    let gameOver = true
    board = [...board].map(input=> input.value)
    let i = 0
    while(gameOver === true && i < cells.length) {
        console.log(cells[i].letter, board[i])
        if (cells[i].letter != board[i]) {
            gameOver = false
        }
        i++
    }
    
    if (gameOver === true) {
        alert('You Win')
    }
}

const resetGame = () => {
    let timerDiv = document.getElementById('timer-div'),
        inputs = document.querySelectorAll('.cell-input')
    highlight(1)
    timerDiv.innerText = '0:00'
    clearInterval(timer)
    inputs.forEach(input => input.value = '')
    configureTimer()
}