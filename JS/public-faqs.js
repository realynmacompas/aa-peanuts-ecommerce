const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item, index) => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent document click from firing
      const isActive = item.classList.contains("active");

      // Close all
      faqItems.forEach(i => i.classList.remove("active"));

      //Re-open clicked item if it wasn't active
      if (!isActive) {
        item.classList.add("active");

        // Scroll if it's the last question
        if (index === faqItems.length - 1) {
          setTimeout(() => {
            item.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }
      }
    });
  });

  // Close all if click is outside any question
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".faq-item")) {
      faqItems.forEach(i => i.classList.remove("active"));
    }
});