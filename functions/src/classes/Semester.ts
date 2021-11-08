// NOTE: this class is disused, but is left in for potential future use
export default class Semester {
  term: string;
  year: number;
  constructor(term: string, year: number) {
    this.term = term;
    this.year = year;
  }
  static fromString(semester: string): Semester {
    let [term, year] = semester.split(" ");
    if (["Fall", "Spring", "Summer", "Winter"].indexOf(term) === -1) {
      term = "Fall"; // Default to Fall
    }
    return new Semester(term, parseInt(year));
  }
}
