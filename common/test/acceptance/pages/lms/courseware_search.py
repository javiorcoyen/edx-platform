"""
Courseware search
"""

from .course_page import CoursePage


class CoursewareSearchPage(CoursePage):
    """
    Coursware page featuring a search form
    """

    url_path = "courseware/"
    search_bar_selector = '#courseware-search-bar'

    @property
    def search_results(self):
        return self.q(css='#courseware-search-results')

    def is_browser_on_page(self):
        return self.q(css=self.search_bar_selector).present

    def enter_search_term(self, text):
        self.q(css=self.search_bar_selector + ' input[type="text"]').fill(text)

    def search(self):
        self.q(css=self.search_bar_selector + ' [type="submit"]').click()
        self.wait_for_element_visibility('.search-info', 'Search results are shown')

    def search_for_term(self, text):
        """
        Search and return results
        """
        self.enter_search_term(text)
        self.search()