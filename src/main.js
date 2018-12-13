function onLoad() {
  request.sendRequest()
}

class Request {
  async sendRequest(query = "", page = 0) {
    const data = await (await fetch(this.getUrl(query, page))).json();
    this.response = new Response(query, data);
  }

  getUrl(query, page) {
    const p = Number.isInteger(page) && page || "";
    return `//hn.algolia.com/api/v1/search?query=${query}&tags=story&page=${p}`;
  }
}

class Response {
  constructor(query, response) {
    if (response) {
      this.query = query;
      this.currentPage = response.page;
      this.maxPage = response.nbPages;
      this.hitsPerPage = response.hits.length;
      this.hits = response.hits;

      new HTMLCreator(this.hitsPerPage, this.hits, this.currentPage, this.maxPage, query);
    }
  }
}

function onSearchInput(event) {
  event.value ? request.sendRequest(event.value, 0) : clearSearch();
}

function onClickNextPage() {
  const res = request.response;

  html.showNextButton(res.currentPage !== res.maxPage);
  request.sendRequest(res.query, ++res.currentPage);
  html.showPreviousButton();
}

function onClickPreviousPage() {
  const res = request.response;

  html.showPreviousButton(res.currentPage !== 1);
  request.sendRequest(res.query, --res.currentPage);
  html.showNextButton();
}

class HTMLCreator {
  constructor(hitsPerPage, hits, currentPage, maxPage, query) {
    this.clearResults();
    this.createStories(hitsPerPage, hits);
    this.displayButtons(currentPage, maxPage);
    this.createPagination(currentPage, maxPage, query);
  }

  createStories(count, hits) {
    let id = -1;
    while (++id < count) {
      const button = this.createRow(id);

      $(".list-group").append(button);
      $("#" + button.id)
        .append(this.createTitle(id, hits))
        .append(this.createDetails(id, hits));
    }
  }

  createRow(id) {
    return $("<div/>", {
      id: "button" + id,
      className: "list-group-item",
      style: "background-color: #f6f5ef; padding: 5px",
    })[0];
  }

  createTitle(id, hits) {
    return $("<a/>", {
      id: "a" + id,
      href: hits[id].url,
      text: hits[id].title,
      target: "_blank",
      class: "dimgray",
      style: "text-decoration: none",
    });
  }

  createDetails(id, hits) {
    const ul = $("<ul/>", {
      style: "list-style: none; padding-left: 0;",
    });

    const li = $("<li/>", {
      style: "display: inline;",
    });

    const link = this.createLink(id, hits);
    const separation = this.createSeperation();
    const pointsAndComments = this.createPointsAndComments(id, hits);
    const author = this.createAuthor(id, hits);

    return ul.append(
      li.append(pointsAndComments))
      .append(separation)
      .append(author)
      .append(separation)
      .append(link);
  }

  createLink(id, hits) {
    return $("<a/>", {
      id: "link" + id,
      href: hits[id].url,
      text: `(${hits[id].url})`,
      target: "_blank",
      class: "dimgray-small",
      style: "display: inline; padding: 5px",
    });
  }

  createSeperation() {
    return $("<li/>", {
      text: `|`,
      class: "dimgray-small",
      style: "display: inline;",
    });
  }

  createPointsAndComments(id, hits) {
    const hit = hits[id];
    const points = hit.points + " point" + (hit.points === 1 ? "" : "s");
    const comments = hit.num_comments + " comment" + (hit.num_comments === 1 ? "" : "s");
    const date = moment(new Date(hit.created_at)).fromNow();

    return $("<a/>", {
      href: "https://news.ycombinator.com/item?id=" + hit.objectID,
      text: points + "  |  " + comments + "  |  " + date,
      title: "See original post on HN",
      target: "_blank",
      class: "dimgray-small",
      style: "display: inline; padding-right: 5px",
    });
  }

  createAuthor(id, hits) {
    return this.createSeperation().append($("<a/>", {
      href: "https://news.ycombinator.com/user?id=" + hits[id].author,
      text: hits[id].author,
      title: "See original post on HN",
      target: "_blank",
      class: "dimgray-small",
      style: "display: inline; padding: 5px",
    }));
  }

  displayButtons(currentPage, maxPage) {
    this.showNextButton(currentPage < maxPage - 1);
    this.showPreviousButton(currentPage !== 0 && currentPage < maxPage);
  }

  createPagination(currentPage, maxPage, query) {
    $("#currentPage").empty().append(this.createPageNumber(currentPage, maxPage, query));
  }

  createPageNumber(currentPage, maxPage, query) {
    if (currentPage !== undefined) {
      $("#currentPage").show();

      if (maxPage === 0) {
        return $("<div/>", {
          html: "No stories matching: <strong>" + query + "<strong>",
        })[0];
      }

      if (!(currentPage === 0 && maxPage === 1)) {
        return $("<div/>", {
          html: `Page ${currentPage + 1} of ${maxPage}`,
        })[0];
      }
    }

    $("#currentPage").hide();
  }

  clearSearch() {
    this.clearResults();
    this.showButtons(false);
  }

  clearResults() {
    $(".list-group").empty();
  }

  showButtons(show = true) {
    this.showPreviousButton(show);
    this.showNextButton(show)
  }

  showNextButton(show = true) {
    const btn = $("#nextButton");
    show ? btn.show() : btn.hide();
  }

  showPreviousButton(show = true) {
    const btn = $("#previousButton");
    show ? btn.show() : btn.hide();
  }
}

let request = new Request();
let html = new HTMLCreator();
