class SourceLocation {

  constructor(public file:string, public location:{}) {}

  public static UNKNOWN:SourceLocation = new SourceLocation('unknown', {});

}

export = SourceLocation;
