// Immediately-Invoked Function Expression 
(function () {
    document.querySelectorAll('[data-insert]').forEach(
        async function(el, index, listObj) {
            const response = await fetch(el.dataset.insert);
            const html = await response.text();
            el.innerHTML = html;
        }
    );
})();
