class CalcController {

    constructor() {

        this._audio = new Audio('./click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';
        this._locale = 'pt-BR';
        this._operation = [];
        this._displayCalcEl = document.querySelector("#display");
        this._dataEl = document.querySelector("#date");
        this._timeEl = document.querySelector("#time");
        this._currentDate;
        this.initialize();
        this.initButtonsEvents();
        this.initKeyboardEvents();

    } // close constructor()

    /**
     * Copy the value of the calculator to the windows clipboard.
     */
    copyToClipboard() {

        let input = document.createElement('input');

        input.value = this.displayCalc;

        document.body.appendChild(input);

        input.select();

        document.execCommand("Copy");

        input.remove();

    } // close copyToClipboard()

    /**
     * Paste the value of the windows cliboard into the calculator.
     */
    pasteFromClipboard() {

        document.addEventListener('paste', e => {

            let text = e.clipboardData.getData('Text');

            // @ts-ignore
            this.displayCalc = parseFloat(text);

            console.log(text);
        });

    } // close pasteFromClipboard()

    /**
     * Initializes the calculator.
     */
    initialize() {

        this.setDisplayDateTime();

        setInterval(() => {

            this.setDisplayDateTime();

        }, 1000);

        this.setLastNumberToDisplay();

        this.pasteFromClipboard();

        document.querySelectorAll('.btn-ac').forEach(btn => {

            btn.addEventListener('dblclick', e => {

                this.toggleAudio();

            });

        });

    } // close initialize()

    /**
     * Turns audio on or off.
     */
    toggleAudio() {

        this._audioOnOff = !this._audioOnOff;

    } // close toggleAudio()

    /**
     * Plays the audio.
     */
    playAudio() {

        if (this._audioOnOff) {

            this._audio.currentTime = 0;
            this._audio.play();

        }

    }

    /**
     * Starts the keyboard event listener.
     */
    initKeyboardEvents() {

        document.addEventListener('keyup', e => {

            this.playAudio();

            switch (e.key) {
                case 'Escape':
                    this.clearAll();
                    break;

                case 'Backspace':
                    this.clearEntry();
                    break;

                case '+':
                case '-':
                case '*':
                case '/':
                case '%':
                    this.addOperation(e.key);
                    break;

                case 'Enter':
                case '=':
                    this.calc();
                    break;

                case '.':
                case ',':
                    this.addDot();
                    break;

                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;

                case 'c':
                    if (e.ctrlKey) this.copyToClipboard();

            } // close switch case

        });

    } // close initKeyboardEvents()

    /**
     * Adds the event listener to all buttons.
     * @param {*} button 
     * @param {*} events 
     * @param {*} fn 
     */
    addEventListenerAll(button, events, fn) {

        events.split(' ').forEach(event => {

            button.addEventListener(event, fn, false);

        });
    } // close addEventListenerAll()

    /**
     * Totally clears the calculator's memory.
     */
    clearAll() {

        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNumberToDisplay();

    } // close clearAll()

    /**
     * Clears the last entry
     */
    clearEntry() {

        this._operation.pop();
        this.setLastNumberToDisplay();

    } // close clearEntry()

    /**
     * Insert error message on the display.
     */
    setError() {

        this.displayCalc = "Error";

    } // close setError()

    /**
     * Insert the point in non-integer numbers.
     */
    addDot() {

        let lasOperation = this.getLastOperation();

        if (typeof lasOperation === 'string' && lasOperation.split('').indexOf('.') > -1) return;

        if (this.isOperator(lasOperation) || !lasOperation) {

            this.pushOperation('0.');

        } else {

            this.setLastOperation(lasOperation.toString() + '.');

        } // close if

        this.setLastNumberToDisplay();

    } // close addDot()

    /**
     * Get the last operation.
     */
    getLastOperation() {

        return this._operation[this._operation.length - 1];

    } // close getLastOperation()

    /**
     * Checks whether the entry is an operator.
     * @param {*} value 
     */
    isOperator(value) {

        return (['+', '-', '*', '/', '%'].indexOf(value) > -1);

    } // close isOperator()

    /**
     * Set the last operation.
     * @param {*} value 
     */
    setLastOperation(value) {

        this._operation[this._operation.length - 1] = value;

    } // close setLastOperation()

    /**
     * Pushes the operation into the array.
     * @param {*} value 
     */
    pushOperation(value) {

        this._operation.push(value);

        if (this._operation.length > 3) {

            this.calc();

        }

    } // close pushOperation()

    /**
     * Get the result.
     */
    getResult() {

        try {

            return eval(this._operation.join(""));
            
        } catch (error) {

            setTimeout(() => {

                this.setError();
                
            }, 1);
        }


    } // close getResult()

    /**
     * Perform operations.
     */
    calc() {

        let last = '';
        this._lastOperator = this.getLastItem();

        if (this._operation.length < 3) {

            let firstItem = this._operation[0];

            this._operation = [firstItem, this._lastOperator, this._lastNumber];

        } // close if

        if (this._operation.length > 3) {

            last = this._operation.pop();
            this._lastNumber = this.getResult();

        } else if (this._operation.length == 3) {

            this._lastNumber = this.getLastItem(false);

        } // close if

        let result = this.getResult();

        if (last == '%') {

            result /= 100;
            this._operation = [result];

        } else {

            this._operation = [result];
            if (last) this._operation.push(last);

        } // close if

        this.setLastNumberToDisplay();

    } // close calc()

    /**
     * Get the last item.
     * @param {*} isOperator 
     */
    getLastItem(isOperator = true) {
        let lastItem;

        for (let i = this._operation.length - 1; i >= 0; i--) {

            if (this.isOperator(this._operation[i]) == isOperator) {

                lastItem = this._operation[i];
                break;

            }
        } // close for

        if (!lastItem) {

            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;

        } // close if

        return lastItem;

    } // close getLastItem()

    /**
     * Displays the last number on the display.
     */
    setLastNumberToDisplay() {
        let lastNumber = this.getLastItem(false);

        if (!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;

    } // close setLstNumberToDisplay()

    /**
     * Add operators to the array.
     * @param {*} value 
     */
    addOperation(value) {

        if (isNaN(this.getLastOperation())) {

            if (this.isOperator(value)) {

                this.setLastOperation(value);

            } else {

                this.pushOperation(value);

                this.setLastNumberToDisplay();
            } // close else if

        } else {

            if (this.isOperator(value)) {

                this.pushOperation(value);

            } else {

                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);
                this.setLastNumberToDisplay();

            } // close if

        } // close if

    } // close addOperation()

    /**
     * Performs button event interactions.
     * @param {*} value 
     */
    execButton(value) {

        this.playAudio();

        switch (value) {

            case 'ac':
                this.clearAll();
                break;

            case 'ce':
                this.clearEntry();
                break;

            case 'sum':
                this.addOperation('+');
                break;

            case 'subtraction':
                this.addOperation('-');
                break;

            case 'multiplication':
                this.addOperation('*');
                break;

            case 'division':
                this.addOperation('/');
                break;

            case 'percent':
                this.addOperation('%');
                break;

            case 'equal':
                this.calc();
                break;

            case 'dot':
                this.addDot();
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;

            default:
                this.setError();
                break;

        } // close switch case

    } // close execButton()

    /**
     * Starts the buttons event listener.
     */
    initButtonsEvents() {

        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        buttons.forEach(button => {

            this.addEventListenerAll(button, "click drag", e => {

                let textButton = button.classList.value.replace('btn-', '');
                this.execButton(textButton);

            });

            this.addEventListenerAll(button, "mouseover mouseup mousedown", e => {

                button.setAttribute("style", "cursor: pointer");

            });

        });

    } // close initButtonEvents()

    /**
     * Sets the date and time on the display.
     */
    setDisplayDateTime() {

        this.displayDate = this.currentDate.toLocaleDateString(this._locale, {

            day: "2-digit",
            month: "long",
            year: "numeric"

        });

        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);

    } // close setDisplayDateTime()

    /**
     * Gets the time.
     */
    get displayTime() {

        return this._timeEl.innerHTML;

    } // close get displayTime()

    /**
     * Sets the time.
     */
    set displayTime(value) {

        this._timeEl.innerHTML = value;

    } // close set displayTime()

    /**
     * Gets the date.
     */
    get displayDate() {

        return this._dataEl.innerHTML;

    } // close get displayDate()

    /**
     * Sets the date.
     */
    set displayDate(value) {

        this._dataEl.innerHTML = value;

    } // close set displayDate()

    /**
     * Gets the value displayed on the calculator display
     */
    get displayCalc() {

        return this._displayCalcEl.innerHTML;

    } // close get displayCalc()

    /**
     * Sets the value to be displayed on the calculator display
     */
    set displayCalc(value) {

        if (value.toString().length > 10) {

            this.setError();
            // @ts-ignore
            return false;

        }

        this._displayCalcEl.innerHTML = value;

    } // close set displayCalc()

    /**
     * Gets the current date.
     */
    get currentDate() {

        return new Date();

    } // close get currentDate()

    /**
     * Sets the current date
     */
    set currentDate(value) {

        this._currentDate = value;

    } // close set currentDate()

} // close CalcController()