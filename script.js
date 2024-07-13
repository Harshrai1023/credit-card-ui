new Vue({
  el: "#app",
  data() {
    return {
      currentCardBackground: Math.floor(Math.random() * 25 + 1),
      cardName: "",
      cardNumber: "",
      cardMonth: "",
      cardYear: "",
      cardCvv: "",
      minCardYear: new Date().getFullYear(),
      amexCardMask: "#### ###### #####",
      otherCardMask: "#### #### #### ####",
      cardNumberTemp: "",
      isCardFlipped: false,
      focusElementStyle: null,
      isInputFocused: false,
      errors: [],
    };
  },
  mounted() {
    this.cardNumberTemp = this.otherCardMask;
    document.getElementById("cardNumber").focus();
  },
  computed: {
    getCardType() {
      let number = this.cardNumber;
      let re = new RegExp("^4");
      if (number.match(re) != null) return "visa";

      re = new RegExp("^(34|37)");
      if (number.match(re) != null) return "amex";

      re = new RegExp("^5[1-5]");
      if (number.match(re) != null) return "mastercard";

      re = new RegExp("^6011");
      if (number.match(re) != null) return "discover";

      re = new RegExp("^9792");
      if (number.match(re) != null) return "troy";

      return "visa"; // default type
    },
    generateCardNumberMask() {
      return this.getCardType === "amex"
        ? this.amexCardMask
        : this.otherCardMask;
    },
    minCardMonth() {
      if (this.cardYear === this.minCardYear) return new Date().getMonth() + 1;
      return 1;
    },
  },
  watch: {
    cardYear() {
      if (this.cardMonth < this.minCardMonth) {
        this.cardMonth = "";
      }
    },
  },
  methods: {
    flipCard(status) {
      this.isCardFlipped = status;
    },
    focusInput(e) {
      this.isInputFocused = true;
      let targetRef = e.target.dataset.ref;
      let target = this.$refs[targetRef];
      this.focusElementStyle = {
        width: `${target.offsetWidth}px`,
        height: `${target.offsetHeight}px`,
        transform: `translateX(${target.offsetLeft}px) translateY(${target.offsetTop}px)`,
      };
    },
    blurInput() {
      let vm = this;
      setTimeout(() => {
        if (!vm.isInputFocused) {
          vm.focusElementStyle = null;
        }
      }, 300);
      vm.isInputFocused = false;
    },
    // Luhn Algorithm for card number validation
    luhnCheck(number) {
      let sum = 0;
      let shouldDouble = false;

      for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number.charAt(i), 10);

        if (shouldDouble) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
      }

      return sum % 10 === 0;
    },
    validateCardNumber() {
      // Remove spaces from card number
      const cardNumber = this.cardNumber.replace(/\s/g, "");
      // Check length and format
      const re = /^[0-9]{13,19}$/;
      if (!re.test(cardNumber)) {
        return false;
      }
      // Check Luhn Algorithm
      return this.luhnCheck(cardNumber);
    },
    validateCardName() {
      const trimmedName = this.cardName.trim();
      const re = /^[a-zA-Z\s]+$/;

      if (trimmedName.length === 0) {
        return false; // Name cannot be empty
      }

      if (!re.test(trimmedName)) {
        return false; // Name contains invalid characters
      }

      if (trimmedName.length > 50) {
        return false; // Name is too long
      }

      return true;
    },

    validateCardDate() {
      if (this.cardMonth.length === 0 || this.cardYear.length === 0) {
        return false;
      }

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const expYear = parseInt(this.cardYear, 10);
      const expMonth = parseInt(this.cardMonth, 10);

      if (
        expYear < currentYear ||
        (expYear === currentYear && expMonth < currentMonth)
      ) {
        return false;
      }

      return true;
    },
    validateCardCvv() {
      const cvvLength = this.getCardType === "amex" ? 4 : 3;
      const re = new RegExp(`^[0-9]{${cvvLength}}$`);
      return re.test(this.cardCvv);
    },

    validateForm() {
      this.errors = [];

      if (!this.validateCardNumber()) {
        this.errors.push("Card number is invalid.");
      }
      if (!this.validateCardName()) {
        this.errors.push("Card holder name is invalid.");
      }
      if (!this.validateCardDate()) {
        this.errors.push("Expiration date is invalid.");
      }
      if (!this.validateCardCvv()) {
        this.errors.push("CVV is invalid.");
      }

      if (this.errors.length === 0) {
        alert("Card details are valid! Submitting...");
        // Submit the form or perform any other necessary actions
      } else {
        alert(this.errors.join("\n"));
      }
    },
  },
});
