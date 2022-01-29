// Immediately-Invoked Function Expression 
(function () {
    document.querySelectorAll('[data-insert]').forEach(
        async function(el, index, listObj) {
            const response = await fetch(el.dataset.insert);
            let html = await response.text();
            // replace placeholders in partial
            // 'data-insert-param' states what to replace, 'data-insert-val' what it will be replaced with
            html = html.replaceAll('#{' + el.dataset.insertParam + '}', el.dataset.insertVal)
            el.innerHTML = html;
        }
    );
})();
