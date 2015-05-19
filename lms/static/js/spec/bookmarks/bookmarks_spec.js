define(['backbone', 'jquery', 'underscore', 'js/common_helpers/ajax_helpers', 'js/common_helpers/template_helpers',
        'js/bookmarks/models/bookmark',
        'js/bookmarks/collections/bookmarks',
        'js/bookmarks/views/bookmarks_button',
        'moment'
       ],
    function (Backbone, $, _, AjaxHelpers, TemplateHelpers, BookmarksModel, BookmarksCollection, BookmarksButtonView) {
        'use strict';

        describe("lms.courseware.bookmarks", function () {

            beforeEach(function () {
                loadFixtures('js/fixtures/bookmarks/bookmarks.html');
                TemplateHelpers.installTemplates(
                    [
                        'templates/message_view',
                        'templates/bookmarks/bookmarks_list'
                    ]
                );
            });

            describe("Bookmarks", function () {
                var bookmarksButtonView;

                beforeEach(function () {
                    bookmarksButtonView = new BookmarksButtonView({});
                    var show = true;
                    var fakeBookmarksShown = function () {
                        show = !show;
                        return show;
                    };
                    spyOn(bookmarksButtonView.bookmarksListView, 'isVisible').andCallFake(fakeBookmarksShown);
                });

                var createBookmarksData = function () {
                    return {
                        results: [
                            {
                                id: 0,
                                display_name: "A Global History of Architecture: Part 1",
                                created: "2014-09-23T14:00:00Z",
                                course_id: "MITx/4.605x_2/3T2014",
                                usage_id: "i4x://RiceX/BIOC300.1x/openassessment/cf4c1de230af407fa214905b90aace57",
                                path: [
                                    {
                                        display_name: "Week 1",
                                        usage_id: "i4x://RiceX/BIOC300.1x/chapter/cf4c1de2efmveoirm1490e57"
                                    },
                                    {
                                        display_name: "Reflection",
                                        usage_id: "i4x://RiceX/BIOC300.1x/sequential/foivmeiormoeriv4905b90aace57"
                                    }
                                ]
                            }
                        ]
                    };
                };

                var verifyBookmarkedData = function (view, expectedData) {
                    var courseId, usageId;
                    courseId = expectedData.results[0].course_id;
                    usageId = expectedData.results[0].usage_id;

                    expect(
                        view.$('.bookmarks-results-list-item')
                    ).toHaveAttr('href', view.createBookmarkUrl(courseId, usageId));
                    expect(view.$('.list-item-breadcrumbtrail').html().trim()).
                        toBe(view.breadcrumbTrail(expectedData.results[0].path, expectedData.results[0].display_name));
                    expect(view.$('.list-item-date').text().trim()).
                        toBe('Bookmarked on ' + view.humanFriendlyDate(expectedData.results[0].created));
                };

                it("has correct behavior for bookmarks button", function () {
                    spyOn(bookmarksButtonView, 'toggleBookmarksListView').andCallThrough();
                    spyOn(bookmarksButtonView.bookmarksListView, 'showBookmarksList').andReturn(true);

                    bookmarksButtonView.delegateEvents();

                    expect(bookmarksButtonView.$('.bookmarks-list-button')).toHaveAttr('aria-pressed', 'false');
                    expect(bookmarksButtonView.$('.bookmarks-list-button')).toHaveClass('is-inactive');

                    bookmarksButtonView.$('.bookmarks-list-button').click();
                    expect(bookmarksButtonView.toggleBookmarksListView).toHaveBeenCalled();
                    expect(bookmarksButtonView.$('.bookmarks-list-button')).toHaveAttr('aria-pressed', 'true');
                    expect(bookmarksButtonView.$('.bookmarks-list-button')).toHaveClass('is-active');

                    bookmarksButtonView.$('.bookmarks-list-button').click();
                    expect(bookmarksButtonView.$('.bookmarks-list-button')).toHaveAttr('aria-pressed', 'false');
                    expect(bookmarksButtonView.$('.bookmarks-list-button')).toHaveClass('is-inactive');
                });

                it("has rendered bookmarked list correctly", function () {
                    var requests = AjaxHelpers.requests(this);
                    var url = bookmarksButtonView.bookmarksListView.url +
                        '?course_id=COURSE_ID&fields=display_name%2Cpath';
                    var expectedData = createBookmarksData();
                    var bookmarksListView = bookmarksButtonView.bookmarksListView;

                    spyOn(bookmarksListView, 'courseId').andReturn('COURSE_ID');
                    bookmarksButtonView.$('.bookmarks-list-button').click();

                    expect($('#loading-message').text().trim()).toBe(bookmarksListView.loadingMessage);

                    AjaxHelpers.expectRequest(requests, 'GET', url);
                    AjaxHelpers.respondWithJson(requests, expectedData);

                    expect(bookmarksListView.$('.bookmarks-results-header').text().trim()).toBe('My Bookmarks');

                    verifyBookmarkedData(bookmarksListView, expectedData);
                });

                it("can navigate to correct url", function () {
                    var requests = AjaxHelpers.requests(this);
                    var bookmarksListView = bookmarksButtonView.bookmarksListView;

                    spyOn(bookmarksListView, 'visitBookmark');

                    bookmarksButtonView.$('.bookmarks-list-button').click();

                    AjaxHelpers.respondWithJson(requests, createBookmarksData());

                    bookmarksListView.$('.bookmarks-results-list-item').click();
                    expect(bookmarksListView.visitBookmark).toHaveBeenCalled();
                });

                it("shows error message for HTTP 500", function () {
                    var requests = AjaxHelpers.requests(this);

                    bookmarksButtonView.$('.bookmarks-list-button').click();

                    AjaxHelpers.respondWithError(requests);

                    expect($('#error-message').text().trim()).toBe(bookmarksButtonView.bookmarksListView.errorMessage);
                });
            });
        });
    });