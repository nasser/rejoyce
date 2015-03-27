#!/usr/bin/env python
from os import listdir
from os.path import isfile, join
import edn_format
import sys
import decimal
import argparse

parser = argparse.ArgumentParser(description="Test valid edn")
parser.add_argument("-d", "--debug", action="store_true", help="debug") 
debug = parser.parse_args().debug

class MyappPerson(edn_format.TaggedElement):
  def __init__(self, name, value):
    self.name = name
    self.value = value

  def __str__(self): 
     return "#myapp/Person " + edn_format.dump(self.value)

edn_format.add_tag("myapp/Person", MyappPerson)

validEdnDir = "../../../../valid-edn"
results = {}

for ednFile in [f for f in listdir(validEdnDir) if isfile(join(validEdnDir, f))]:
  ednFileName = ednFile.split(".")[0]
  validEdn = open(join(validEdnDir, ednFileName + ".edn"), "r").read()
  expectedPy = open(join("..", ednFileName + ".py"), "r").read()
  if debug: 
    print ednFileName
  try: 
    expected = eval(expectedPy)
    parsed = edn_format.loads(validEdn)
    result = expected == parsed
    if not result and debug:
      print "Values did not match", "\n\tEXPECTED: ", edn_format.dumps(expected), "\n\tPARSED: ", edn_format.dumps(parsed), "\n\tEDN: ", validEdn
    results[edn_format.Symbol(ednFileName)] = result
  except:
    e = sys.exc_info()[0] 
    results[edn_format.Symbol(ednFileName)] = False
    if debug:
      print "\tFailed to parse.", validEdn, e

print edn_format.dumps(results)

