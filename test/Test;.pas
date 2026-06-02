unit Test;

interface

uses
  System.StrUtils;

type
  TTest = class
  public
    function Test: string;
  end;

implementation

function TTest.Test: string;
begin
  Result := 'Hello World';
end;

end.