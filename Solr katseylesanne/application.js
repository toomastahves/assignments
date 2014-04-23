// Location of server.
var solr_url = "http://uptsearch.cloudapp.net/solr/rss/select";

// Finds all news sources.
function find_news_sources() {
    console.log("Requesting sources from server...");
    var sources = new Array();
    $.ajax({
        'url': solr_url,
        'dataType': 'jsonp',
        'jsonp': 'json.wrf',
        'data': {
            'wt': 'json',
            'q': '*',
            'rows': '0',
            'facet': 'true',
            'facet.limit': '-1',
            'facet.field': 'source'
        },
        'success': function (data) {
            var news_sources = data.facet_counts.facet_fields.source;
            console.log("JSON success, found rows: " + news_sources.length);
            for (var key = 0; key < news_sources.length; key++) {
                var source_name = news_sources[key];
                var source_news_count = news_sources[key + 1];
                sources.push(source_name + "," + source_news_count);
                key += 1;
            }
            console.log("Found total sources: " + sources.length);
            draw_tables(sources);
        }
    });
}
find_news_sources();

// Starts to draw tables.
function draw_tables(sources) {
    console.log("Starting to draw tables, acquired sources count: " + sources.length);

    for (var key = 0; key < sources.length; key++) {
        var table_data = sources[key].split(',');
        var source_name = table_data[0];
        var news_count = table_data[1];

        console.log("Starting to draw table for: " + source_name);
        var news_table;
        news_table = $("<table id=" + table_data[0] + " class=\"table table-bordered table-responsive table-condensed\">");
        news_table.append("<thead><tr><td colspan=\"3\" class=\"text-center\"><button id=" + source_name + " class=\"btn btn-default btn-lg btn-block\">Feed provider: " + source_name + " (news count: " + news_count + ")</button></td></tr></thead>");
        var newstable = find_three_news(news_table, source_name);
        news_table.append(newstable);
        news_table.append("</table>");
        $('.container').append(news_table);

        console.log("Finished to draw table for: " + source_name);
    }
}

// Finds three news articles.
function find_three_news(news_table, source_name) {
    $.ajax({
        'url': solr_url,
        'dataType': 'jsonp',
        'jsonp': 'json.wrf',
        'data': {
            'wt': 'json',
            'q': '*',
            'rows': 3,
            'fl': 'title',
            'sort': 'date desc',
            'fq': 'source:' + source_name
        },
        'success': function (data) {
            console.log("JSON success, found 3 news.");
            var news = data.response.docs;
            news_table.append("<tbody><tr>");
            for (var key = 0; key < news.length; key++) {
                news_table.append("<td><div class=\"well\">" + news[key].title + "</div></td>");
            }
            news_table.append("</tr></tbody>");
        }
    });
    return news_table;
}

// Loads all available news from selected source.
$("body").on("click", "button", function () {
    var source_name = this.id;
    console.log("Getting all news from: " + source_name);
    $.ajax({
        'url': solr_url,
        'dataType': 'jsonp',
        'jsonp': 'json.wrf',
        'data': {
            'wt': 'json',
            'q': '*',
            'rows': 1000,
            'fl': 'title',
            'sort': 'date desc',
            'fq': 'source:' + source_name
        },
        'success': function (data) {
            console.log("JSON Success. Getting all news from: " + source_name);
            var allnews = data.response.docs;
            var table_selector = '#' + source_name;
            $(table_selector).html("<thead><tr><td colspan=\"3\" class=\"text-center\"><button id=" + source_name + " class=\"btn btn-default btn-lg btn-block\">All news from: " + source_name + "</button></td></tr></thead>");
            var rowchanger = 0;
            var rowdata = "";
            for (var key = 0; key < allnews.length; key++) {
                if (rowchanger === 0) {
                    rowdata += "<tr>";
                }
                rowchanger++;
                rowdata += "<td><div class=\"well\">" + allnews[key].title + "</div></td>";
                if (rowchanger === 3) {
                    $(table_selector).append("</tr>");
                    rowchanger = 0;
                    $(table_selector).append(rowdata);
                    rowdata = "";
                }
            }
            $(table_selector).append(rowdata);
        }
    });
});
